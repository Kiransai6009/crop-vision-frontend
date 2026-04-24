/**
 * RiskAlertSystem.tsx  — Module 4
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Enter current conditions (rainfall, temperature, NDVI)
 *  • System evaluates risk rules:
 *      - Low rainfall  (<50mm)  → Drought Risk
 *      - Low NDVI      (<0.3)   → Crop Stress Risk
 *      - High temp     (>40°C)  → Heat Stress Risk
 *      - Combo         → Multi-Risk Alert
 *  • Displays styled alert cards per risk detected
 *  • Auto-refreshes evaluation on input change
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, CloudRain, Thermometer, Leaf, ShieldCheck, Zap, Wifi, MapPin, RefreshCw } from "lucide-react";
import { useLiveWeather, DISTRICT_NAMES } from "../../hooks/useLiveWeather";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── Risk Rule definitions ────────────────────────────────────────── */
interface RiskRule {
    id: string;
    title: string;
    condition: (r: number, t: number, n: number) => boolean;
    severity: "critical" | "warning" | "info";
    message: string;
    action: string;
    icon: React.ElementType;
}

const RISK_RULES: RiskRule[] = [
    {
        id: "drought",
        title: "Drought Risk",
        condition: (r) => r < 50,
        severity: "critical",
        message: "⚠ Drought risk detected. Rainfall below critical threshold (50mm).",
        action: "Start irrigation immediately. Mulch soil to reduce evaporation. Consider drought-tolerant crop varieties.",
        icon: CloudRain,
    },
    {
        id: "heatstress",
        title: "Heat Stress Risk",
        condition: (_r, t) => t > 40,
        severity: "critical",
        message: "🌡 Extreme temperature detected (> 40°C). Crop heat stress likely.",
        action: "Irrigate during cooler hours (early morning/evening). Use shade nets. Monitor crop closely.",
        icon: Thermometer,
    },
    {
        id: "cropstress",
        title: "Crop Stress (Low NDVI)",
        condition: (_r, _t, n) => n < 0.3,
        severity: "warning",
        message: "🌿 Low NDVI detected (< 0.3). Crop health is poor.",
        action: "Inspect field for pests, disease, or nutrient deficiency. Apply nitrogen fertilizer. Soil test recommended.",
        icon: Leaf,
    },
    {
        id: "highNDVI-drought",
        title: "Irrigation Opportunity",
        condition: (r, _t, n) => r < 80 && n >= 0.3 && n <= 0.6,
        severity: "info",
        message: "💧 Moderate NDVI with low rainfall — supplemental irrigation can boost yield.",
        action: "Schedule drip or sprinkler irrigation 2× per week. Monitor for 2 weeks.",
        icon: CloudRain,
    },
];

const SEVERITY_STYLES = {
    critical: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-600", badge: "bg-red-500 text-white" },
    warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-600", badge: "bg-yellow-500 text-white" },
    info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600", badge: "bg-blue-500 text-white" },
};

/* ── Component ─────────────────────────────────────────────────────── */
const RiskAlertSystem = () => {
    const [rainfall, setRainfall] = useState("35");
    const [temperature, setTemperature] = useState("38");
    const [ndvi, setNdvi] = useState("0.25");

    /* Live weather */
    const [liveDistrict, setLiveDistrict] = useState("Hyderabad");
    const { data: liveData, refresh: refreshLive } = useLiveWeather(liveDistrict);

    const fillLive = () => {
        if (liveData.status !== "live") { refreshLive(); return; }
        setRainfall(liveData.current.rainfall.toString());
        setTemperature(liveData.current.temp.toString());
        setNdvi(liveData.ndvi.toFixed(3));
    };

    const r = parseFloat(rainfall) || 0;
    const t = parseFloat(temperature) || 0;
    const n = parseFloat(ndvi) || 0;

    /* Evaluate all rules */
    const activeRisks = RISK_RULES.filter(rule => rule.condition(r, t, n));
    const isAllClear = activeRisks.length === 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                    Risk Alert System
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Real-time detection of drought, heat stress, and crop health risks based on current conditions.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ── Input Panel ──────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current Conditions</h3>

                    {/* Live fill row */}
                    <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
                        <Wifi className={`w-3.5 h-3.5 ${liveData.status === "live" ? "text-green-500" : "text-muted-foreground"}`} />
                        <Select
                            value={liveDistrict}
                            onValueChange={setLiveDistrict}
                        >
                            <SelectTrigger className="flex-1 text-xs px-2 py-1.5 h-auto bg-muted border border-border rounded-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DISTRICT_NAMES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <button
                            onClick={fillLive}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
                        >
                            {liveData.status === "loading"
                                ? <RefreshCw className="w-3 h-3 animate-spin" />
                                : <MapPin className="w-3 h-3" />}
                            Use Live Data
                        </button>
                    </div>

                    {/* Rainfall */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <CloudRain className="w-3.5 h-3.5 text-blue-500" /> Weekly Rainfall (mm)
                        </span>
                        <input
                            type="number" value={rainfall}
                            onChange={(e) => setRainfall(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. 35"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>0mm</span><span className="text-red-500">⚠ &lt;50mm</span><span>500mm</span>
                        </div>
                    </label>

                    {/* Temperature */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <Thermometer className="w-3.5 h-3.5 text-orange-500" /> Temperature (°C)
                        </span>
                        <input
                            type="number" value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. 38"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>10°C</span><span className="text-red-500">⚠ &gt;40°C</span><span>55°C</span>
                        </div>
                    </label>

                    {/* NDVI */}
                    <label className="block">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                            <Leaf className="w-3.5 h-3.5 text-green-500" /> NDVI Value (0–1)
                        </span>
                        <input
                            type="number" step="0.01" min="0" max="1" value={ndvi}
                            onChange={(e) => setNdvi(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g. 0.25"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span className="text-red-500">0 (Poor)</span><span className="text-yellow-500">0.3</span><span className="text-green-500">1.0 (Healthy)</span>
                        </div>
                    </label>

                    {/* Risk summary */}
                    <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                            {isAllClear
                                ? <><ShieldCheck className="w-5 h-5 text-green-600" /><span className="text-sm font-semibold text-green-600">All Clear — No Risks Detected</span></>
                                : <><Zap className="w-5 h-5 text-red-500" /><span className="text-sm font-semibold text-red-500">{activeRisks.length} Risk{activeRisks.length > 1 ? "s" : ""} Detected</span></>
                            }
                        </div>
                    </div>
                </div>

                {/* ── Alerts Panel ─────────────────────────────────────── */}
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {isAllClear ? (
                            <motion.div
                                key="clear"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center h-64"
                            >
                                <CheckCircle className="w-14 h-14 text-green-600 mb-3" />
                                <p className="font-bold text-green-700 text-lg">All Clear!</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Conditions are within safe ranges.<br />No risks detected.
                                </p>
                            </motion.div>
                        ) : (
                            activeRisks.map((risk) => {
                                const styles = SEVERITY_STYLES[risk.severity];
                                const Icon = risk.icon;
                                return (
                                    <motion.div
                                        key={risk.id}
                                        initial={{ opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -24 }}
                                        className={`rounded-xl border p-4 ${styles.bg} ${styles.border}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${styles.badge}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className={`font-bold text-sm ${styles.text}`}>{risk.title}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${styles.badge}`}>
                                                        {risk.severity.toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-foreground mb-2">{risk.message}</p>
                                                <div className="bg-background/60 rounded-lg p-3">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Recommended Action:</p>
                                                    <p className="text-xs text-muted-foreground">{risk.action}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Threshold Reference Table ─────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Risk Thresholds Reference</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Parameter</th>
                                <th className="text-left py-2 px-3 text-red-500 font-medium">🔴 Critical</th>
                                <th className="text-left py-2 px-3 text-yellow-500 font-medium">🟡 Warning</th>
                                <th className="text-left py-2 px-3 text-green-600 font-medium">🟢 Safe</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border/50">
                                <td className="py-2 px-3 text-foreground">Rainfall</td>
                                <td className="py-2 px-3 text-muted-foreground">&lt; 30mm</td>
                                <td className="py-2 px-3 text-muted-foreground">30–50mm</td>
                                <td className="py-2 px-3 text-muted-foreground">&gt; 50mm</td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-2 px-3 text-foreground">Temperature</td>
                                <td className="py-2 px-3 text-muted-foreground">&gt; 42°C</td>
                                <td className="py-2 px-3 text-muted-foreground">40–42°C</td>
                                <td className="py-2 px-3 text-muted-foreground">&lt; 40°C</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 text-foreground">NDVI</td>
                                <td className="py-2 px-3 text-muted-foreground">&lt; 0.2</td>
                                <td className="py-2 px-3 text-muted-foreground">0.2–0.3</td>
                                <td className="py-2 px-3 text-muted-foreground">&gt; 0.3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RiskAlertSystem;
