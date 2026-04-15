/**
 * WeatherDashboard.tsx  — Module 3  (LIVE DATA VERSION)
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • REAL live weather via Open-Meteo API (free, no key needed)
 *  • District selector for any major Indian city/district
 *  • Current stats: temp, humidity, rainfall, wind, UV, feels-like
 *  • 7-day daily forecast cards
 *  • Rainfall + temperature chart
 *  • Irrigation advisory
 *  • Auto-refresh every 10 minutes
 *  • Live NDVI estimate from seasonal weather signals
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CloudRain, Thermometer, Droplets, Wind, Sun,
    Umbrella, RefreshCw, Wifi, WifiOff, MapPin, Zap,
    ChevronDown
} from "lucide-react";
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useLiveWeather, DISTRICT_NAMES } from "../../hooks/useLiveWeather";
import { useGlobalLocation } from "../../context/LocationContext";

/* ── Stat card component ─────────────────────────────────────────── */
const StatCard = ({
    icon: Icon, label, value, unit, sub, iconBg, trend
}: {
    icon: React.ElementType; label: string; value: string | number;
    unit: string; sub: string; iconBg: string; trend?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1"
    >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${iconBg}`}>
            <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-display font-bold text-foreground tabular-nums">
            {value}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </p>
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
        {trend && <p className="text-xs text-primary font-medium mt-1">{trend}</p>}
    </motion.div>
);

/* ── Component ─────────────────────────────────────────────────────── */
const WeatherDashboard = () => {
    const { city, lat, lon } = useGlobalLocation();
    
    const customCoords = (lat && lon) ? { lat, lon, state: "" } : undefined;
    const { data, setDistrict, refresh } = useLiveWeather(city || "Hyderabad", customCoords);
    
    const [showDistrictPicker, setShowDistrictPicker] = useState(false);
    const [search, setSearch] = useState("");
    const [viewMode, setViewMode] = useState<"weekly" | "ndvi">("weekly");

    const { current, forecast, status, ndvi, ndviLabel, district, state, lastFetch } = data;

    /* Filtered districts for search */
    const filteredDistricts = DISTRICT_NAMES.filter(d =>
        d.toLowerCase().includes(search.toLowerCase())
    );

    /* Weekly rain total for irrigation advisory */
    const weeklyRain = forecast.reduce((s, d) => s + d.rain, 0);
    const irrigationMsg =
        weeklyRain < 30 ? "💧 Low rainfall this week. Schedule irrigation 3×/week." :
            weeklyRain < 100 ? "✅ Adequate rainfall. Supplement irrigation if needed." :
                "🚫 Heavy rain expected. Pause irrigation & ensure drainage.";

    /* Time since last fetch */
    const lastFetchStr = lastFetch
        ? new Date(lastFetch).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "--:--";

    /* NDVI color classes */
    const ndviColor = ndvi > 0.6 ? "text-green-600" : ndvi >= 0.3 ? "text-yellow-600" : "text-red-600";
    const ndviBg = ndvi > 0.6 ? "bg-green-500/10 border-green-500/30" : ndvi >= 0.3 ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30";

    return (
        <div className="max-w-5xl mx-auto space-y-6">

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <CloudRain className="w-6 h-6 text-blue-500" />
                        Live Weather Dashboard
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Real-time weather data from Open-Meteo API. Updated every 10 minutes.
                    </p>
                </div>

                {/* Live badge + refresh */}
                <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${status === "live" ? "bg-green-500/10 border-green-500/30 text-green-700" :
                            status === "loading" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700" :
                                "bg-red-500/10 border-red-500/30 text-red-700"
                        }`}>
                        {status === "live" ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {status === "live" ? `Live · ${lastFetchStr}` : status === "loading" ? "Fetching…" : "Offline"}
                    </span>
                    <button
                        onClick={refresh}
                        disabled={status === "loading"}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors disabled:opacity-50"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 text-muted-foreground ${status === "loading" ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ── District Picker ───────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Location</span>
                    <span className="ml-auto text-xs text-muted-foreground">{district}, {state}</span>
                </div>
                <button
                    onClick={() => setShowDistrictPicker(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-muted border border-border text-sm text-foreground hover:border-primary/50 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {district}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDistrictPicker ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                    {showDistrictPicker && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-2 border border-border rounded-xl overflow-hidden">
                                <input
                                    type="text"
                                    placeholder="Search district or city…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-muted border-b border-border text-foreground focus:outline-none"
                                    autoFocus
                                />
                                <div className="max-h-52 overflow-y-auto">
                                    {filteredDistricts.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => { setDistrict(d); setShowDistrictPicker(false); setSearch(""); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 transition-colors ${d === district ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                    {filteredDistricts.length === 0 && (
                                        <p className="px-4 py-3 text-sm text-muted-foreground">No results.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Current weather condition banner ─────────────────────── */}
            {status !== "loading" && current.icon && (
                <motion.div
                    key={district}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl px-6 py-5 flex items-center gap-4"
                >
                    <span className="text-5xl">{current.icon}</span>
                    <div>
                        <p className="text-2xl font-display font-bold text-foreground">
                            {current.temp}°C  <span className="text-base font-normal text-muted-foreground">Feels like {current.feelsLike}°C</span>
                        </p>
                        <p className="text-muted-foreground text-sm mt-0.5">{current.condition} · {district}</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-sm text-muted-foreground">UV Index</p>
                        <p className={`text-xl font-bold ${current.uvIndex >= 8 ? "text-red-600" : current.uvIndex >= 4 ? "text-yellow-600" : "text-green-600"}`}>
                            {current.uvIndex}
                            <span className="text-xs font-normal ml-1 text-muted-foreground">
                                {current.uvIndex >= 8 ? "Very High" : current.uvIndex >= 4 ? "Moderate" : "Low"}
                            </span>
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Loading skeleton */}
            {status === "loading" && (
                <div className="bg-muted border border-border rounded-xl px-6 py-5 animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted-foreground/20" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted-foreground/20 rounded w-1/3" />
                        <div className="h-3 bg-muted-foreground/20 rounded w-1/4" />
                    </div>
                </div>
            )}

            {/* ── Stat cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={Thermometer} label="Temperature" value={current.temp} unit="°C" sub={`Feels ${current.feelsLike}°C`} iconBg="bg-orange-500/10 text-orange-500" />
                <StatCard icon={Droplets} label="Humidity" value={current.humidity} unit="%" sub="Relative humidity" iconBg="bg-cyan-500/10 text-cyan-500" />
                <StatCard icon={CloudRain} label="Rainfall" value={current.rainfall} unit="mm" sub="Current hour" iconBg="bg-blue-500/10 text-blue-500" />
                <StatCard icon={Wind} label="Wind Speed" value={current.wind} unit="km/h" sub="Surface level" iconBg="bg-violet-500/10 text-violet-500" />
                <StatCard icon={Sun} label="UV Index" value={current.uvIndex} unit="" sub={current.uvIndex >= 6 ? "Use sunscreen!" : "Safe levels"} iconBg="bg-yellow-500/10 text-yellow-500" />
                <StatCard icon={Zap} label="Est. NDVI" value={ndvi.toFixed(3)} unit="" sub={`Crop health: ${ndviLabel}`} iconBg="bg-green-500/10 text-green-500" trend={`Based on week's rainfall ${weeklyRain.toFixed(0)}mm`} />
            </div>

            {/* ── NDVI live estimate banner ─────────────────────────────── */}
            <div className={`border rounded-xl px-5 py-4 flex items-center gap-3 ${ndviBg}`}>
                <span className="text-2xl">{ndvi > 0.6 ? "🟢" : ndvi >= 0.3 ? "🟡" : "🔴"}</span>
                <div>
                    <p className={`font-semibold text-sm ${ndviColor}`}>
                        Estimated NDVI: {ndvi.toFixed(3)} — {ndviLabel} Crop Conditions
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Computed from live rainfall, humidity, temperature, and current season (March).
                        {ndvi < 0.3 ? " Consider irrigation and soil inspection." : ""}
                    </p>
                </div>
            </div>

            {/* ── 7-Day Forecast ───────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
                    7-Day Forecast · {district}
                </h3>
                {forecast.length > 0 ? (
                    <div className="grid grid-cols-7 gap-1.5">
                        {forecast.map((d, i) => (
                            <motion.div
                                key={d.date}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-colors ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted hover:bg-muted/70"
                                    }`}
                            >
                                <p className="text-[11px] font-semibold text-foreground">{d.day}</p>
                                <span className="text-xl">{d.icon}</span>
                                <p className="text-sm font-bold text-foreground">{d.tempMax}°</p>
                                <p className="text-[10px] text-muted-foreground">{d.tempMin}°</p>
                                <p className="text-[11px] text-blue-500 font-medium">{d.rain}mm</p>
                                <p className="text-[9px] text-muted-foreground">{d.humidity}%</p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-7 gap-1.5">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Irrigation Advisory ───────────────────────────────────── */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4 flex items-start gap-3">
                <Umbrella className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                    <p className="font-semibold text-foreground text-sm">Irrigation Advisory</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{irrigationMsg}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        7-day expected rainfall: <strong>{weeklyRain.toFixed(0)}mm</strong>
                    </p>
                </div>
            </div>

            {/* ── Chart ─────────────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-primary" />
                        Rainfall &amp; Temperature (7-Day)
                    </h3>
                    <p className="text-xs text-muted-foreground">Live data · {district}</p>
                </div>
                {forecast.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                        <ComposedChart data={forecast}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
                            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(160,10%,50%)" />
                            <YAxis yAxisId="left" label={{ value: "Rain (mm)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} tick={{ fontSize: 11 }} domain={[0, "auto"]} />
                            <YAxis yAxisId="right" orientation="right" label={{ value: "Temp (°C)", angle: 90, position: "insideRight", style: { fontSize: 10 } }} tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                                formatter={(v: number, name: string) => [
                                    name.includes("Rain") ? `${v} mm` : `${v}°C`, name
                                ]}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar yAxisId="left" dataKey="rain" name="Rainfall (mm)" fill="hsl(200,70%,50%)" radius={[4, 4, 0, 0]} opacity={0.8} />
                            <Line yAxisId="right" type="monotone" dataKey="tempMax" name="Temp Max (°C)" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="tempMin" name="Temp Min (°C)" stroke="hsl(210,80%,60%)" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading chart data…
                    </div>
                )}
            </div>

            {/* ── Error state ───────────────────────────────────────────── */}
            {status === "error" && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-700">
                    ⚠ Could not fetch live weather data. Please check your internet connection and refresh.
                </div>
            )}

            {/* ── Attribution ───────────────────────────────────────────── */}
            <p className="text-xs text-muted-foreground text-center">
                Weather data provided by{" "}
                <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Open-Meteo
                </a>{" "}
                (open-source, free). NDVI estimated from seasonal rainfall &amp; humidity.
            </p>
        </div>
    );
};

export default WeatherDashboard;
