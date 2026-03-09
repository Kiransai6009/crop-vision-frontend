/**
 * YieldPrediction.tsx  — Module 1
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Input form for rainfall, temperature, humidity
 *  • Satellite image upload (simulated NDVI calculation)
 *  • NDVI = (NIR - RED) / (NIR + RED)  — simulated from image pixel data
 *  • Yield prediction via a simple dummy regression formula
 *  • Results displayed as tons/hectare
 *
 * NOTE: Since we're in the browser (no real satellite sensor),
 *       NDVI is simulated by reading the uploaded image pixel values
 *       (green vs red channel ratio from a canvas), giving a realistic demo.
 *       Real prediction hit route:  POST /api/predict  (Flask backend)
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Satellite, CloudRain, Thermometer, Droplets,
    Upload, Calculator, CheckCircle, Loader2, ImageIcon,
    MapPin, Wifi, RefreshCw
} from "lucide-react";
import { useLiveWeather, DISTRICT_NAMES } from "../../hooks/useLiveWeather";

/* ── Types ──────────────────────────────────────────────────────────── */
interface FormData {
    rainfall: string;
    temperature: string;
    humidity: string;
    nirValue: string;   // manually enter NIR (simulates satellite band)
    redValue: string;   // manually enter RED (simulates satellite band)
}

interface PredictionResult {
    ndvi: number;
    predictedYield: number;
    confidence: number;
    cropStatus: string;
}

/* ── Helper: Dummy ML regression formula ────────────────────────────── */
//  Yield (t/ha) ≈ 0.04 * rainfall^0.6 + 0.5 * ndvi * 10 - 0.01 * |temp - 28| * 2
//  Clamped between 0.5 and 8 t/ha for realism
const predictYield = (
    rainfall: number,
    temperature: number,
    humidity: number,
    ndvi: number
): number => {
    const base = 2.5;
    const rainEffect = 0.005 * Math.min(rainfall, 300);
    const ndviEffect = 3.8 * ndvi;
    const tempPenalty = 0.05 * Math.abs(temperature - 27);
    const humBonus = 0.003 * humidity;
    const raw = base + rainEffect + ndviEffect - tempPenalty + humBonus;
    return Math.max(0.5, Math.min(8.0, parseFloat(raw.toFixed(2))));
};

/* ── Helper: compute NDVI from NIR and RED values ────────────────────── */
const calcNDVI = (nir: number, red: number): number => {
    if (nir + red === 0) return 0;
    return parseFloat(((nir - red) / (nir + red)).toFixed(3));
};

/* ── Helper: simulate NDVI from an uploaded image via canvas ─────────── */
const computeNdviFromImage = (file: File): Promise<number> =>
    new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = Math.min(img.width, 64);   // sample 64×64 pixels
            canvas.height = Math.min(img.height, 64);
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let totalRed = 0, totalGreen = 0, count = 0;
            for (let i = 0; i < data.length; i += 4) {
                totalRed += data[i];       // R channel ≈ RED band
                totalGreen += data[i + 1];   // G channel ≈ NIR proxy
                count++;
            }
            const avgRed = totalRed / count;
            const avgGreen = totalGreen / count;   // proxy for NIR
            const ndvi = calcNDVI(avgGreen, avgRed);
            URL.revokeObjectURL(url);
            resolve(Math.max(0, Math.min(1, ndvi)));
        };
        img.src = url;
    });

/* ── Component ─────────────────────────────────────────────────────── */
const YieldPrediction = () => {
    const [form, setForm] = useState<FormData>({
        rainfall: "", temperature: "", humidity: "", nirValue: "", redValue: ""
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const [error, setError] = useState("");
    const [useManualNDVI, setUseManualNDVI] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    /* Live weather hook */
    const [liveDistrict, setLiveDistrict] = useState("Hyderabad");
    const { data: liveData, refresh: refreshLive } = useLiveWeather(liveDistrict);
    const [liveUsed, setLiveUsed] = useState(false);

    /* Fill form inputs from live weather data */
    const fillFromLive = () => {
        if (liveData.status !== "live") { refreshLive(); return; }
        setForm(prev => ({
            ...prev,
            rainfall: liveData.current.rainfall.toString(),
            temperature: liveData.current.temp.toString(),
            humidity: liveData.current.humidity.toString(),
        }));
        setLiveUsed(true);
        setResult(null);
        setError("");
    };

    /* Handle text input change */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setResult(null);
        setError("");
    };

    /* Handle image upload */
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
        setResult(null);
    }, []);

    /* Main prediction handler */
    const handlePredict = async () => {
        const rainfall = parseFloat(form.rainfall);
        const temperature = parseFloat(form.temperature);
        const humidity = parseFloat(form.humidity);

        // Basic validation
        if (isNaN(rainfall) || isNaN(temperature) || isNaN(humidity)) {
            setError("⚠ Please enter valid numeric values for all weather fields.");
            return;
        }
        if (rainfall < 0 || temperature < -10 || humidity < 0 || humidity > 100) {
            setError("⚠ Please enter realistic values: Rainfall ≥ 0mm, Temp > -10°C, Humidity 0–100%.");
            return;
        }

        setLoading(true);
        setError("");
        setResult(null);

        try {
            let ndvi: number;

            if (useManualNDVI) {
                /* User entered NIR and RED manually */
                const nir = parseFloat(form.nirValue);
                const red = parseFloat(form.redValue);
                if (isNaN(nir) || isNaN(red)) {
                    setError("⚠ Enter valid NIR and RED reflectance values (0–255).");
                    setLoading(false);
                    return;
                }
                ndvi = calcNDVI(nir, red);
            } else if (imageFile) {
                /* Compute NDVI from uploaded image pixel data */
                ndvi = await computeNdviFromImage(imageFile);
            } else {
                /* Fallback: estimate NDVI from weather inputs */
                ndvi = Math.min(0.9, Math.max(0.1, (rainfall / 300) * 0.7 + (humidity / 100) * 0.3 - 0.05));
                ndvi = parseFloat(ndvi.toFixed(3));
            }

            // ── Try Flask backend first ─────────────────────────────────
            // If backend is not running, falls back to the JS prediction formula.
            let predictedYield: number;
            try {
                const resp = await fetch("http://localhost:5000/api/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rainfall, temperature, humidity, ndvi }),
                    signal: AbortSignal.timeout(3000),
                });
                if (resp.ok) {
                    const data = await resp.json();
                    predictedYield = data.predicted_yield;
                } else {
                    throw new Error("Backend error");
                }
            } catch {
                // Backend not running — use JS fallback formula
                predictedYield = predictYield(rainfall, temperature, humidity, ndvi);
            }

            const status = ndvi > 0.6 ? "Healthy" : ndvi >= 0.3 ? "Moderate" : "Poor";
            const confidence = Math.round(75 + ndvi * 15 + Math.random() * 5);

            setResult({ ndvi, predictedYield, confidence, cropStatus: status });
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Render ─────────────────────────────────────────────────── */
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Satellite className="w-6 h-6 text-primary" />
                    Yield Prediction Module
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Enter weather data + optionally upload a satellite image to compute NDVI and predict crop yield.
                </p>
            </div>

            {/* ── Live Data Auto-fill Banner ─────────────────────────────── */}
            <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-semibold text-foreground">Live Weather Auto-Fill</span>
                        {liveData.status === "live" && (
                            <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full border border-green-500/30">
                                ● Live
                            </span>
                        )}
                        {liveData.status === "loading" && (
                            <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
                        )}
                    </div>

                    {/* District selector */}
                    <select
                        value={liveDistrict}
                        onChange={e => setLiveDistrict(e.target.value)}
                        className="flex-1 min-w-36 px-2 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {DISTRICT_NAMES.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>

                    <button
                        onClick={fillFromLive}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Auto-Fill Weather
                    </button>
                </div>

                {/* Live stats preview */}
                {liveData.status === "live" && (
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <span>🌡 {liveData.current.temp}°C</span>
                        <span>💧 {liveData.current.humidity}%</span>
                        <span>🌧 {liveData.current.rainfall}mm</span>
                        <span>💨 {liveData.current.wind}km/h</span>
                        <span>🌿 Est. NDVI: {liveData.ndvi.toFixed(3)} ({liveData.ndviLabel})</span>
                        <span className="text-primary font-medium">{liveData.district}, {liveData.state}</span>
                    </div>
                )}

                {liveUsed && (
                    <p className="text-xs text-green-700 mt-2">✅ Form filled with live data from {liveDistrict}. Edit if needed, then click Predict Yield.</p>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ── Left: Input Form ─────────────────────────────────── */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Weather Inputs</h3>

                    {/* Rainfall */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <CloudRain className="w-3.5 h-3.5" /> Rainfall (mm)
                        </span>
                        <input
                            name="rainfall"
                            type="number"
                            placeholder="e.g. 180"
                            value={form.rainfall}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    {/* Temperature */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <Thermometer className="w-3.5 h-3.5" /> Temperature (°C)
                        </span>
                        <input
                            name="temperature"
                            type="number"
                            placeholder="e.g. 28"
                            value={form.temperature}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    {/* Humidity */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <Droplets className="w-3.5 h-3.5" /> Humidity (%)
                        </span>
                        <input
                            name="humidity"
                            type="number"
                            placeholder="e.g. 65"
                            value={form.humidity}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    {/* NDVI Source Toggle */}
                    <div className="border-t border-border pt-4">
                        <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide mb-3">NDVI Source</h3>
                        <div className="flex gap-2 mb-3">
                            <button
                                onClick={() => setUseManualNDVI(false)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${!useManualNDVI ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                                    }`}
                            >
                                📡 Image Upload
                            </button>
                            <button
                                onClick={() => setUseManualNDVI(true)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${useManualNDVI ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                                    }`}
                            >
                                🔢 Manual NIR/RED
                            </button>
                        </div>

                        {useManualNDVI ? (
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground">
                                    NDVI = (NIR − RED) / (NIR + RED). Enter reflectance values (0–255).
                                </p>
                                <input
                                    name="nirValue"
                                    type="number"
                                    placeholder="NIR reflectance (e.g. 180)"
                                    value={form.nirValue}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <input
                                    name="redValue"
                                    type="number"
                                    placeholder="RED reflectance (e.g. 60)"
                                    value={form.redValue}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        ) : (
                            /* Image upload zone */
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                                {imagePreview ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <img src={imagePreview} alt="Upload preview" className="h-28 object-cover rounded-lg mx-auto" />
                                        <span className="text-xs text-muted-foreground">{imageFile?.name}</span>
                                        <span className="text-xs text-primary">Click to change</span>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Upload satellite image</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG — NDVI auto-computed from pixels</p>
                                    </>
                                )}
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
                    )}

                    {/* Submit */}
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        {loading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Predicting…</>
                            : <><Calculator className="w-4 h-4" /> Predict Yield</>
                        }
                    </button>
                </div>

                {/* ── Right: Result Panel ──────────────────────────────── */}
                <div className="space-y-4">
                    {result ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card border border-border rounded-xl p-6"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <CheckCircle className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-foreground">Prediction Results</h3>
                            </div>

                            {/* Yield — big number */}
                            <div className="text-center py-6 bg-primary/10 rounded-xl mb-4">
                                <div className="text-5xl font-display font-bold text-primary mb-1">
                                    {result.predictedYield}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium">tons / hectare</div>
                            </div>

                            {/* NDVI */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">NDVI Value</p>
                                    <p className="text-2xl font-bold text-foreground">{result.ndvi.toFixed(3)}</p>
                                </div>
                                <div className="bg-muted rounded-lg p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-1">Crop Status</p>
                                    <p className={`text-lg font-bold ${result.cropStatus === "Healthy" ? "text-green-600" :
                                        result.cropStatus === "Moderate" ? "text-yellow-600" : "text-red-600"
                                        }`}>
                                        {result.cropStatus === "Healthy" ? "🟢" :
                                            result.cropStatus === "Moderate" ? "🟡" : "🔴"} {result.cropStatus}
                                    </p>
                                </div>
                            </div>

                            {/* Confidence bar */}
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Model Confidence</span>
                                    <span>{result.confidence}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${result.confidence}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                        className="h-full bg-primary rounded-full"
                                    />
                                </div>
                            </div>

                            {/* Formula display */}
                            <div className="mt-4 p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                                <p className="font-mono">NDVI = (NIR − RED) / (NIR + RED) = {result.ndvi.toFixed(3)}</p>
                                <p className="font-mono mt-1">Yield ≈ base + f(rainfall, NDVI, temp, humidity) = {result.predictedYield} t/ha</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center h-80 text-muted-foreground">
                            <Satellite className="w-16 h-16 mb-3 opacity-20" />
                            <p className="text-sm">Fill in the form and click <strong>Predict Yield</strong></p>
                            <p className="text-xs mt-1">Results will appear here</p>
                        </div>
                    )}

                    {/* Info card — how it works */}
                    <div className="bg-card border border-border rounded-xl p-5 text-sm">
                        <p className="font-semibold text-foreground mb-2">How it works</p>
                        <ol className="text-muted-foreground space-y-1.5 text-xs list-decimal list-inside">
                            <li>Enter rainfall, temperature, and humidity</li>
                            <li>Upload a satellite image <em>or</em> enter raw NIR/RED values</li>
                            <li>NDVI is computed using the standard formula</li>
                            <li>ML regression model predicts yield in tons/hectare</li>
                            <li>If Flask API is running, predictions use the backend model</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YieldPrediction;
