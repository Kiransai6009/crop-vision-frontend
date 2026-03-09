/**
 * SatelliteAnalysis.tsx — Satellite Data Advanced Analysis Module
 * ─────────────────────────────────────────────────────────────────────────
 * Features:
 *  • Sentinel-2 & Landsat 8 satellite source selector
 *  • NDVI / EVI vegetation index calculation & visualization
 *  • Soil moisture estimation
 *  • Crop stress detection (water/disease/nutrient)
 *  • Vegetation map color-coded by health zone
 *  • Band value sliders for interactive index computation
 * ─────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Satellite, Layers, Droplets, AlertTriangle, Map,
    ChevronDown, Info, TrendingUp, Eye, Zap
} from "lucide-react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter
} from "recharts";

/* ── Types ──────────────────────────────────────────────────────────── */
type SatSource = "sentinel2" | "landsat8";
type StressType = "water" | "disease" | "nutrient" | "none";

/* ── Helper: NDVI ------------------------------------------------------ */
const calcNDVI = (nir: number, red: number): number => {
    if (nir + red === 0) return 0;
    return parseFloat(((nir - red) / (nir + red)).toFixed(4));
};

/* ── Helper: EVI -------------------------------------------------------- */
const calcEVI = (nir: number, red: number, blue: number): number => {
    const denom = nir + 6 * red - 7.5 * blue + 1;
    if (denom === 0) return 0;
    return parseFloat((2.5 * ((nir - red) / denom)).toFixed(4));
};

/* ── NDVI color for vegetation map cells ------------------------------- */
const ndviToCellColor = (v: number): string => {
    if (v > 0.7) return "bg-green-700";
    if (v > 0.5) return "bg-green-500";
    if (v > 0.3) return "bg-yellow-400";
    if (v > 0.1) return "bg-orange-400";
    return "bg-red-500";
};

/* ── Monthly NDVI trend data (simulated Sentinel-2 composite) ---------- */
const MONTHLY_NDVI: Record<SatSource, { month: string; ndvi: number; evi: number }[]> = {
    sentinel2: [
        { month: "Jan", ndvi: 0.22, evi: 0.18 },
        { month: "Feb", ndvi: 0.30, evi: 0.25 },
        { month: "Mar", ndvi: 0.48, evi: 0.40 },
        { month: "Apr", ndvi: 0.63, evi: 0.54 },
        { month: "May", ndvi: 0.79, evi: 0.68 },
        { month: "Jun", ndvi: 0.86, evi: 0.74 },
        { month: "Jul", ndvi: 0.83, evi: 0.71 },
        { month: "Aug", ndvi: 0.74, evi: 0.62 },
        { month: "Sep", ndvi: 0.59, evi: 0.50 },
        { month: "Oct", ndvi: 0.40, evi: 0.33 },
        { month: "Nov", ndvi: 0.28, evi: 0.22 },
        { month: "Dec", ndvi: 0.20, evi: 0.16 },
    ],
    landsat8: [
        { month: "Jan", ndvi: 0.19, evi: 0.15 },
        { month: "Feb", ndvi: 0.27, evi: 0.22 },
        { month: "Mar", ndvi: 0.44, evi: 0.37 },
        { month: "Apr", ndvi: 0.60, evi: 0.51 },
        { month: "May", ndvi: 0.76, evi: 0.65 },
        { month: "Jun", ndvi: 0.84, evi: 0.72 },
        { month: "Jul", ndvi: 0.80, evi: 0.68 },
        { month: "Aug", ndvi: 0.71, evi: 0.60 },
        { month: "Sep", ndvi: 0.56, evi: 0.47 },
        { month: "Oct", ndvi: 0.37, evi: 0.30 },
        { month: "Nov", ndvi: 0.24, evi: 0.20 },
        { month: "Dec", ndvi: 0.17, evi: 0.14 },
    ],
};

/* ── 8×8 vegetation map grid (simulated NDVI tiles) ─────────────────── */
const generateGrid = (baseNDVI: number): number[][] =>
    Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => {
            const noise = (Math.sin(r * 3.7 + c * 1.9) * 0.15) + (Math.cos(r * 1.1 + c * 4.3) * 0.10);
            return Math.max(0, Math.min(1, baseNDVI + noise));
        })
    );

/* ── Stress classifier ───────────────────────────────────────────────── */
const classifyStress = (ndvi: number, moisture: number): { type: StressType; label: string; color: string; desc: string } => {
    if (ndvi > 0.6 && moisture > 0.5) return { type: "none", label: "No Stress", color: "text-green-600", desc: "Crops appear healthy with adequate moisture and vigorous growth." };
    if (ndvi > 0.4 && moisture < 0.3) return { type: "water", label: "Water Stress", color: "text-blue-600", desc: "Low soil moisture detected. Crops may be experiencing drought stress. Irrigate promptly." };
    if (ndvi < 0.4 && moisture > 0.4) return { type: "disease", label: "Disease Stress", color: "text-red-600", desc: "Adequate moisture but low NDVI may indicate fungal infection or pest infestation." };
    if (ndvi < 0.35) return { type: "nutrient", label: "Nutrient Deficiency", color: "text-orange-600", desc: "Poor vegetative growth despite moderate moisture. Soil nutrient test recommended." };
    return { type: "none", label: "Moderate Health", color: "text-yellow-600", desc: "Crop conditions are moderate. Monitor over next 2 weeks." };
};

/* ── Radar chart data ───────────────────────────────────────────────── */
const buildRadar = (ndvi: number, evi: number, moisture: number) => [
    { subject: "NDVI", value: Math.round(ndvi * 100) },
    { subject: "EVI", value: Math.round(evi * 100) },
    { subject: "Soil Moisture", value: Math.round(moisture * 100) },
    { subject: "Canopy Cover", value: Math.round(ndvi * 95) },
    { subject: "Biomass", value: Math.round(evi * 90 + 5) },
    { subject: "Chlorophyll", value: Math.round((ndvi * 0.7 + evi * 0.3) * 100) },
];

/* ══════════════════════════════════════════════════════════════════════ */
const SatelliteAnalysis = () => {
    const [source, setSource] = useState<SatSource>("sentinel2");
    const [nir, setNir] = useState(0.65);
    const [red, setRed] = useState(0.15);
    const [blue, setBlue] = useState(0.08);
    const [moisture, setMoisture] = useState(0.55);
    const [showInfo, setShowInfo] = useState(false);
    const [activeMonth, setActiveMonth] = useState<string | null>(null);

    const ndvi = calcNDVI(nir, red);
    const evi = calcEVI(nir, red, blue);
    const stress = classifyStress(ndvi, moisture);
    const grid = generateGrid(ndvi);
    const radarData = buildRadar(ndvi, evi, moisture);
    const trendData = MONTHLY_NDVI[source];

    const ndviColor = ndvi > 0.6 ? "text-green-600" : ndvi >= 0.3 ? "text-yellow-600" : "text-red-600";
    const eviColor = evi > 0.5 ? "text-green-600" : evi >= 0.25 ? "text-yellow-600" : "text-red-600";

    const BandSlider = useCallback(({
        label, value, onChange, color, min = 0, max = 1, step = 0.01
    }: {
        label: string; value: number; onChange: (v: number) => void;
        color: string; min?: number; max?: number; step?: number;
    }) => (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground font-medium">{label}</span>
                <span className={`font-mono font-bold ${color}`}>{value.toFixed(3)}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full accent-primary h-2"
            />
        </div>
    ), []);

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <Satellite className="w-6 h-6 text-primary" />
                        Satellite Data Analysis
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        NDVI &amp; EVI vegetation indices, soil moisture, and crop stress detection from satellite imagery.
                    </p>
                </div>
                <button
                    onClick={() => setShowInfo(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                >
                    <Info className="w-3.5 h-3.5" /> About Indices
                </button>
            </div>

            {/* ── Info Panel ───────────────────────────────────────────── */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-bold text-foreground mb-1">🛰 NDVI (Normalized Difference Vegetation Index)</p>
                                <p className="text-muted-foreground">NDVI = (NIR − Red) / (NIR + Red). Values range from -1 to 1. Above 0.6 indicates dense, healthy vegetation.</p>
                            </div>
                            <div>
                                <p className="font-bold text-foreground mb-1">🌿 EVI (Enhanced Vegetation Index)</p>
                                <p className="text-muted-foreground">EVI = 2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1). Less affected by atmosphere and soil background than NDVI.</p>
                            </div>
                            <div>
                                <p className="font-bold text-foreground mb-1">💧 Soil Moisture Index</p>
                                <p className="text-muted-foreground">Derived from SWIR and NIR band ratios. Higher values indicate greater soil water content, affecting irrigation decisions.</p>
                            </div>
                            <div>
                                <p className="font-bold text-foreground mb-1">📡 Sentinel-2 vs Landsat 8</p>
                                <p className="text-muted-foreground">Sentinel-2 (10m resolution, 5-day revisit) vs Landsat 8 (30m resolution, 16-day revisit). Sentinel-2 preferred for crop monitoring.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Satellite Source Selector ────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Satellite className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground text-sm">Satellite Source</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                    {([
                        { id: "sentinel2", name: "Sentinel-2", res: "10m resolution", revisit: "5-day revisit", badge: "ESA" },
                        { id: "landsat8", name: "Landsat 8", res: "30m resolution", revisit: "16-day revisit", badge: "NASA/USGS" },
                    ] as const).map(sat => (
                        <button
                            key={sat.id}
                            onClick={() => setSource(sat.id)}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${source === sat.id
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/40"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${source === sat.id ? "bg-primary text-white" : "bg-muted"}`}>
                                <Satellite className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-foreground text-sm">{sat.name}</p>
                                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-semibold">{sat.badge}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{sat.res} · {sat.revisit}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Band Sliders + Index Display ────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Band inputs */}
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">Spectral Band Values</h3>
                    </div>
                    <p className="text-xs text-muted-foreground -mt-2">Adjust band reflectance values (0–1) to simulate different field conditions.</p>
                    <BandSlider label="NIR Band (Near-Infrared)" value={nir} onChange={setNir} color="text-violet-600" />
                    <BandSlider label="Red Band" value={red} onChange={setRed} color="text-red-600" />
                    <BandSlider label="Blue Band" value={blue} onChange={setBlue} color="text-blue-600" />
                    <BandSlider label="Soil Moisture Index" value={moisture} onChange={setMoisture} color="text-cyan-600" />
                </div>

                {/* Computed indices */}
                <div className="space-y-3">
                    {[
                        {
                            icon: "🌿", label: "NDVI", value: ndvi.toFixed(4),
                            desc: ndvi > 0.6 ? "Dense Healthy Vegetation" : ndvi >= 0.3 ? "Sparse / Moderate Vegetation" : "Bare Soil / Severe Stress",
                            color: ndviColor, bg: ndvi > 0.6 ? "bg-green-600/10 border-green-600/30" : ndvi >= 0.3 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-500/10 border-red-500/30",
                            bar: Math.max(0, Math.min(100, ((ndvi + 1) / 2) * 100)),
                            barColor: ndvi > 0.6 ? "bg-green-500" : ndvi >= 0.3 ? "bg-yellow-400" : "bg-red-500",
                        },
                        {
                            icon: "🛰", label: "EVI", value: evi.toFixed(4),
                            desc: evi > 0.5 ? "Excellent Canopy Response" : evi >= 0.25 ? "Moderate Canopy Coverage" : "Low Biomass / Stressed",
                            color: eviColor, bg: evi > 0.5 ? "bg-green-600/10 border-green-600/30" : evi >= 0.25 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-500/10 border-red-500/30",
                            bar: Math.max(0, Math.min(100, evi * 100)),
                            barColor: evi > 0.5 ? "bg-green-500" : evi >= 0.25 ? "bg-yellow-400" : "bg-red-500",
                        },
                        {
                            icon: "💧", label: "Soil Moisture", value: (moisture * 100).toFixed(1) + "%",
                            desc: moisture > 0.5 ? "Adequate — Good field capacity" : moisture >= 0.3 ? "Low — Supplemental irrigation advised" : "Very Low — Immediate irrigation needed",
                            color: moisture > 0.5 ? "text-cyan-600" : moisture >= 0.3 ? "text-yellow-600" : "text-red-600",
                            bg: moisture > 0.5 ? "bg-cyan-500/10 border-cyan-500/30" : moisture >= 0.3 ? "bg-yellow-400/10 border-yellow-400/30" : "bg-red-500/10 border-red-500/30",
                            bar: moisture * 100,
                            barColor: moisture > 0.5 ? "bg-cyan-500" : moisture >= 0.3 ? "bg-yellow-400" : "bg-red-500",
                        },
                    ].map(item => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-card border rounded-xl p-4 ${item.bg}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <p className="font-bold text-foreground">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                                <span className={`font-mono font-bold text-lg ${item.color}`}>{item.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted mt-2">
                                <div className={`h-2 rounded-full transition-all duration-500 ${item.barColor}`} style={{ width: `${item.bar}%` }} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ── Stress Detection Panel ───────────────────────────────── */}
            <motion.div
                key={stress.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-5 border-2 flex items-start gap-4 ${stress.type === "none" ? "bg-green-500/5 border-green-500/30" :
                        stress.type === "water" ? "bg-blue-500/5 border-blue-500/30" :
                            stress.type === "disease" ? "bg-red-500/5 border-red-500/30" :
                                "bg-orange-500/5 border-orange-500/30"
                    }`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stress.type === "none" ? "bg-green-500/20" :
                        stress.type === "water" ? "bg-blue-500/20" :
                            stress.type === "disease" ? "bg-red-500/20" : "bg-orange-500/20"
                    }`}>
                    {stress.type === "none" ? <Zap className="w-6 h-6 text-green-600" /> :
                        stress.type === "water" ? <Droplets className="w-6 h-6 text-blue-600" /> :
                            <AlertTriangle className="w-6 h-6 text-red-600" />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className={`font-bold text-lg ${stress.color}`}>{stress.label} Detected</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{stress.desc}</p>
                    {stress.type !== "none" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {stress.type === "water" && ["Activate drip irrigation", "Apply mulching", "Schedule evening watering"].map(a => (
                                <span key={a} className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">{a}</span>
                            ))}
                            {stress.type === "disease" && ["Contact agronomist", "Apply fungicide", "Improve drainage"].map(a => (
                                <span key={a} className="text-xs bg-red-500/10 text-red-700 px-2 py-1 rounded-full">{a}</span>
                            ))}
                            {stress.type === "nutrient" && ["Soil test recommended", "Apply NPK fertilizer", "Check pH levels"].map(a => (
                                <span key={a} className="text-xs bg-orange-500/10 text-orange-700 px-2 py-1 rounded-full">{a}</span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Charts Row: Trend + Radar ─────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Trend chart */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">NDVI & EVI Monthly Trend — {source === "sentinel2" ? "Sentinel-2" : "Landsat 8"}</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trendData} onMouseMove={d => d?.activePayload && setActiveMonth(d.activePayload[0]?.payload?.month)}>
                            <defs>
                                <linearGradient id="ndviGrad2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="eviGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(160,10%,40%)" />
                            <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} stroke="hsl(160,10%,40%)" />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 11 }}
                                formatter={(v: number, name: string) => [v.toFixed(3), name]}
                            />
                            <Area type="monotone" dataKey="ndvi" name="NDVI" stroke="#16a34a" strokeWidth={2} fill="url(#ndviGrad2)" />
                            <Area type="monotone" dataKey="evi" name="EVI" stroke="#7c3aed" strokeWidth={2} fill="url(#eviGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2 justify-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 rounded inline-block" /> NDVI</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-600 rounded inline-block" /> EVI</span>
                    </div>
                </div>

                {/* Radar chart */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Eye className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">Vegetation Health Radar</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="hsl(150,12%,88%)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(160,10%,40%)" }} />
                            <Radar name="Health" dataKey="value" stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Vegetation Map ───────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground text-sm">Vegetation Health Map (8×8 Grid Tiles)</h3>
                    </div>
                    <span className="text-xs text-muted-foreground">Simulated based on NDVI = {ndvi.toFixed(3)}</span>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(8, 1fr)" }}>
                    {grid.flatMap((row, r) =>
                        row.map((val, c) => (
                            <div
                                key={`${r}-${c}`}
                                title={`NDVI: ${val.toFixed(3)}`}
                                className={`aspect-square rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-white/50 ${ndviToCellColor(val)}`}
                            />
                        ))
                    )}
                </div>
                <div className="flex flex-wrap gap-3 mt-4 justify-center text-xs">
                    {[
                        { color: "bg-green-700", label: "NDVI > 0.7 — Dense/Healthy" },
                        { color: "bg-green-500", label: "0.5–0.7 — Moderate Health" },
                        { color: "bg-yellow-400", label: "0.3–0.5 — Sparse Vegetation" },
                        { color: "bg-orange-400", label: "0.1–0.3 — Stressed" },
                        { color: "bg-red-500", label: "< 0.1 — Bare Soil" },
                    ].map(l => (
                        <span key={l.label} className="flex items-center gap-1.5">
                            <span className={`w-3 h-3 rounded-sm inline-block ${l.color}`} />
                            <span className="text-muted-foreground">{l.label}</span>
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Attribution ─────────────────────────────────────────── */}
            <p className="text-xs text-muted-foreground text-center">
                Satellite indices simulated using ESA Sentinel-2 and NASA/USGS Landsat 8 spectral band methodology.
                Production systems integrate with{" "}
                <a href="https://earthengine.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Google Earth Engine
                </a> or{" "}
                <a href="https://scihub.copernicus.eu" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Copernicus Open Access Hub
                </a>.
            </p>
        </div>
    );
};

export default SatelliteAnalysis;
