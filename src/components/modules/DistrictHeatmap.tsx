/**
 * DistrictHeatmap.tsx  — Module 9
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Simulated heatmap with colored district blocks
 *  • Color coding:
 *      🟢 Green  = High yield (NDVI > 0.6)
 *      🟡 Yellow = Moderate   (NDVI 0.3–0.6)
 *      🔴 Red    = Low yield  (NDVI < 0.3)
 *  • Click a district to see details
 *  • Filter by state
 *  • Summary stats at the bottom
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Info, X } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────── */
interface District {
    id: string;
    name: string;
    state: string;
    ndvi: number;
    yield: number;
    rainfall: number;
    temp: number;
}

/* ── Simulated district data ─────────────────────────────────────────── */
const DISTRICTS: District[] = [
    { id: "d01", name: "Guntur", state: "Andhra Pradesh", ndvi: 0.78, yield: 4.8, rainfall: 165, temp: 27 },
    { id: "d02", name: "Krishna", state: "Andhra Pradesh", ndvi: 0.72, yield: 4.4, rainfall: 140, temp: 29 },
    { id: "d03", name: "West Godavari", state: "Andhra Pradesh", ndvi: 0.81, yield: 5.1, rainfall: 195, temp: 26 },
    { id: "d04", name: "East Godavari", state: "Andhra Pradesh", ndvi: 0.68, yield: 4.0, rainfall: 130, temp: 28 },
    { id: "d05", name: "Nellore", state: "Andhra Pradesh", ndvi: 0.55, yield: 3.4, rainfall: 90, temp: 31 },
    { id: "d06", name: "Kurnool", state: "Andhra Pradesh", ndvi: 0.38, yield: 2.4, rainfall: 55, temp: 33 },
    { id: "d07", name: "Anantapur", state: "Andhra Pradesh", ndvi: 0.24, yield: 1.6, rainfall: 35, temp: 36 },
    { id: "d08", name: "Karimnagar", state: "Telangana", ndvi: 0.70, yield: 4.3, rainfall: 155, temp: 28 },
    { id: "d09", name: "Warangal", state: "Telangana", ndvi: 0.64, yield: 3.9, rainfall: 120, temp: 29 },
    { id: "d10", name: "Nalgonda", state: "Telangana", ndvi: 0.44, yield: 2.8, rainfall: 78, temp: 33 },
    { id: "d11", name: "Mahabubnagar", state: "Telangana", ndvi: 0.27, yield: 1.8, rainfall: 40, temp: 37 },
    { id: "d12", name: "Hyderabad", state: "Telangana", ndvi: 0.15, yield: 0.9, rainfall: 25, temp: 38 },
    { id: "d13", name: "Nashik", state: "Maharashtra", ndvi: 0.69, yield: 4.1, rainfall: 160, temp: 27 },
    { id: "d14", name: "Pune", state: "Maharashtra", ndvi: 0.62, yield: 3.7, rainfall: 130, temp: 28 },
    { id: "d15", name: "Ahmednagar", state: "Maharashtra", ndvi: 0.41, yield: 2.6, rainfall: 72, temp: 32 },
    { id: "d16", name: "Aurangabad", state: "Maharashtra", ndvi: 0.33, yield: 2.1, rainfall: 55, temp: 34 },
    { id: "d17", name: "Solapur", state: "Maharashtra", ndvi: 0.22, yield: 1.4, rainfall: 30, temp: 38 },
    { id: "d18", name: "Nagpur", state: "Maharashtra", ndvi: 0.58, yield: 3.6, rainfall: 105, temp: 30 },
    { id: "d19", name: "Amritsar", state: "Punjab", ndvi: 0.84, yield: 5.4, rainfall: 200, temp: 24 },
    { id: "d20", name: "Ludhiana", state: "Punjab", ndvi: 0.80, yield: 5.0, rainfall: 185, temp: 25 },
    { id: "d21", name: "Patiala", state: "Punjab", ndvi: 0.76, yield: 4.7, rainfall: 175, temp: 26 },
    { id: "d22", name: "Gurdaspur", state: "Punjab", ndvi: 0.71, yield: 4.3, rainfall: 160, temp: 25 },
    { id: "d23", name: "Bathinda", state: "Punjab", ndvi: 0.65, yield: 3.9, rainfall: 120, temp: 28 },
    { id: "d24", name: "Jaipur", state: "Rajasthan", ndvi: 0.28, yield: 1.7, rainfall: 38, temp: 38 },
    { id: "d25", name: "Jodhpur", state: "Rajasthan", ndvi: 0.15, yield: 0.9, rainfall: 18, temp: 42 },
    { id: "d26", name: "Bikaner", state: "Rajasthan", ndvi: 0.11, yield: 0.7, rainfall: 12, temp: 44 },
    { id: "d27", name: "Alwar", state: "Rajasthan", ndvi: 0.36, yield: 2.3, rainfall: 60, temp: 36 },
    { id: "d28", name: "Kota", state: "Rajasthan", ndvi: 0.49, yield: 3.0, rainfall: 88, temp: 32 },
    { id: "d29", name: "Muzaffarpur", state: "Bihar", ndvi: 0.73, yield: 4.5, rainfall: 168, temp: 26 },
    { id: "d30", name: "Patna", state: "Bihar", ndvi: 0.65, yield: 4.0, rainfall: 140, temp: 27 },
    { id: "d31", name: "Gaya", state: "Bihar", ndvi: 0.55, yield: 3.3, rainfall: 105, temp: 29 },
    { id: "d32", name: "Bhagalpur", state: "Bihar", ndvi: 0.60, yield: 3.7, rainfall: 118, temp: 28 },
];

/* ── Color helper ─────────────────────────────────────────────────── */
const getColor = (ndvi: number) =>
    ndvi > 0.6 ? { bg: "bg-green-500", text: "text-green-900", label: "High Yield", border: "border-green-600" } :
        ndvi >= 0.3 ? { bg: "bg-yellow-400", text: "text-yellow-900", label: "Moderate Yield", border: "border-yellow-500" } :
            { bg: "bg-red-500", text: "text-red-50", label: "Low Yield", border: "border-red-600" };

const ALL_STATES = ["All", ...Array.from(new Set(DISTRICTS.map(d => d.state))).sort()];

/* ── Component ─────────────────────────────────────────────────────── */
const DistrictHeatmap = () => {
    const [activeState, setActiveState] = useState("All");
    const [selected, setSelected] = useState<District | null>(null);

    const filtered = activeState === "All"
        ? DISTRICTS
        : DISTRICTS.filter(d => d.state === activeState);

    const high = filtered.filter(d => d.ndvi > 0.6).length;
    const moderate = filtered.filter(d => d.ndvi >= 0.3 && d.ndvi <= 0.6).length;
    const low = filtered.filter(d => d.ndvi < 0.3).length;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Map className="w-6 h-6 text-teal-500" />
                    District-Level Yield Heatmap
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Simulated heatmap showing yield levels by district. Useful for government-level crop planning.
                </p>
            </div>

            {/* ── Legend ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3">
                {[
                    { color: "bg-green-500", label: "🟢 High Yield  (NDVI > 0.6)" },
                    { color: "bg-yellow-400", label: "🟡 Moderate    (NDVI 0.3 – 0.6)" },
                    { color: "bg-red-500", label: "🔴 Low Yield   (NDVI < 0.3)" },
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-4 h-4 rounded ${l.color}`} />
                        {l.label}
                    </div>
                ))}
            </div>

            {/* ── State Filter ─────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {ALL_STATES.map(s => (
                    <button
                        key={s}
                        onClick={() => setActiveState(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeState === s
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* ── Heatmap Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                <AnimatePresence mode="popLayout">
                    {filtered.map((d) => {
                        const c = getColor(d.ndvi);
                        return (
                            <motion.button
                                key={d.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                onClick={() => setSelected(d)}
                                className={`
                  relative p-3 rounded-xl ${c.bg} border-2 ${c.border}
                  cursor-pointer transition-shadow hover:shadow-lg text-left
                `}
                            >
                                <p className={`text-xs font-bold leading-tight ${c.text} truncate`}>{d.name}</p>
                                <p className={`text-[10px] font-mono mt-0.5 ${c.text} opacity-80`}>
                                    NDVI {d.ndvi.toFixed(2)}
                                </p>
                                <p className={`text-[10px] font-semibold mt-0.5 ${c.text}`}>{d.yield} t/ha</p>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ── District Detail Popup ─────────────────────────────────── */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-6 right-6 z-50 w-72 bg-card border border-border rounded-2xl shadow-2xl p-5"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="font-bold text-foreground text-lg">{selected.name}</p>
                                <p className="text-xs text-muted-foreground">{selected.state}</p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {(() => {
                            const c = getColor(selected.ndvi);
                            return (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className={`font-semibold ${c.bg === "bg-green-500" ? "text-green-600" : c.bg === "bg-yellow-400" ? "text-yellow-600" : "text-red-600"}`}>
                                            {c.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">NDVI</span>
                                        <span className="font-mono text-foreground">{selected.ndvi.toFixed(3)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Pred. Yield</span>
                                        <span className="font-bold text-primary">{selected.yield} t/ha</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rainfall</span>
                                        <span className="text-foreground">{selected.rainfall}mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Temperature</span>
                                        <span className="text-foreground">{selected.temp}°C</span>
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                            <Info className="w-3 h-3" /> Click anywhere else to dismiss
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Summary Stats ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "High Yield Districts", count: high, color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/30" },
                    { label: "Moderate Yield Districts", count: moderate, countLabel: "Moderate Yield", color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
                    { label: "Low Yield Districts", count: low, color: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30" },
                ].map(s => (
                    <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center hover:scale-[1.02] transition-transform`}>
                        <p className={`text-3xl font-display font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">{s.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DistrictHeatmap;
