/**
 * PredictionHistory.tsx  — Module 8
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Stores all predictions in browser localStorage
 *  • Displays a history table with date, crop, NDVI, yield
 *  • Line chart showing yield trend over time
 *  • Clear history button
 *  • Demo: also shows 5 pre-seeded historical entries
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, TrendingUp, Plus } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ── Types ──────────────────────────────────────────────────────────── */
export interface HistoryEntry {
    id: string;
    date: string;          // ISO date string
    crop: string;
    district: string;
    rainfall: number;
    temperature: number;
    humidity: number;
    ndvi: number;
    yield: number;          // predicted yield t/ha
}

const STORAGE_KEY = "cropvision_history";

/* ── Seed data ──────────────────────────────────────────────────────── */
const SEED_DATA: HistoryEntry[] = [
    { id: "s1", date: "2024-06-10", crop: "Rice", district: "Guntur", rainfall: 180, temperature: 28, humidity: 74, ndvi: 0.72, yield: 4.5 },
    { id: "s2", date: "2024-08-22", crop: "Wheat", district: "Nashik", rainfall: 95, temperature: 26, humidity: 60, ndvi: 0.61, yield: 3.8 },
    { id: "s3", date: "2024-10-05", crop: "Maize", district: "Pune", rainfall: 60, temperature: 30, humidity: 55, ndvi: 0.48, yield: 4.2 },
    { id: "s4", date: "2024-12-14", crop: "Rice", district: "Karimnagar", rainfall: 22, temperature: 32, humidity: 45, ndvi: 0.29, yield: 2.1 },
    { id: "s5", date: "2025-02-28", crop: "Wheat", district: "Amritsar", rainfall: 140, temperature: 24, humidity: 68, ndvi: 0.80, yield: 5.1 },
];

/* ── Utility ─────────────────────────────────────────────────────────── */
const loadHistory = (): HistoryEntry[] => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return SEED_DATA;          // default: seed data
        const parsed = JSON.parse(raw) as HistoryEntry[];
        return parsed.length ? parsed : SEED_DATA;
    } catch {
        return SEED_DATA;
    }
};

const saveHistory = (entries: HistoryEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

/* Add a new prediction to history (called from YieldPrediction via shared store — here shown as a demo form) */

/* ── Component ─────────────────────────────────────────────────────── */
const PredictionHistory = () => {
    const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newEntry, setNewEntry] = useState<Partial<HistoryEntry>>({
        crop: "Rice", district: "Demo District", rainfall: 120, temperature: 28, humidity: 65, ndvi: 0.6, yield: 4.0
    });

    /* Persist on change */
    useEffect(() => { saveHistory(history); }, [history]);

    /* Sort newest first */
    const sorted = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    /* Chart: chronologically sorted */
    const chartData = [...history]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(e => ({
            date: e.date.slice(0, 10),
            yield: e.yield,
            ndvi: e.ndvi,
            name: `${e.crop} (${e.district})`,
        }));

    const handleAdd = () => {
        if (!newEntry.crop || !newEntry.yield) return;
        const entry: HistoryEntry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            crop: newEntry.crop || "Unknown",
            district: newEntry.district || "—",
            rainfall: Number(newEntry.rainfall) || 0,
            temperature: Number(newEntry.temperature) || 0,
            humidity: Number(newEntry.humidity) || 0,
            ndvi: Number(newEntry.ndvi) || 0,
            yield: Number(newEntry.yield) || 0,
        };
        setHistory(prev => [entry, ...prev]);
        setShowAddForm(false);
    };

    const handleClear = () => {
        if (window.confirm("Clear all prediction history?")) {
            setHistory([]);
        }
    };

    const ndviStatus = (n: number) =>
        n > 0.6 ? "🟢" : n >= 0.3 ? "🟡" : "🔴";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-500" />
                        Prediction History
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        All past predictions stored in your browser. {history.length} entries recorded.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Entry
                    </button>
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors border border-destructive/20"
                    >
                        <Trash2 className="w-4 h-4" /> Clear
                    </button>
                </div>
            </div>

            {/* ── Add Entry Form ───────────────────────────────────────── */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Add Prediction Entry</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {([
                                    ["crop", "Crop"],
                                    ["district", "District"],
                                    ["rainfall", "Rainfall (mm)"],
                                    ["temperature", "Temp (°C)"],
                                    ["humidity", "Humidity (%)"],
                                    ["ndvi", "NDVI (0–1)"],
                                    ["yield", "Yield (t/ha)"],
                                ] as [keyof HistoryEntry, string][]).map(([k, label]) => (
                                    <label key={k} className="block">
                                        <span className="text-xs text-muted-foreground">{label}</span>
                                        <input
                                            type={k === "crop" || k === "district" ? "text" : "number"}
                                            step={k === "ndvi" ? "0.01" : undefined}
                                            value={String(newEntry[k] ?? "")}
                                            onChange={(e) => setNewEntry(prev => ({ ...prev, [k]: e.target.value }))}
                                            className="w-full mt-1 px-2 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleAdd} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Save Entry
                                </button>
                                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Yield Trend Chart ─────────────────────────────────────── */}
            {chartData.length > 1 && (
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold text-foreground">Yield & NDVI Trend Over Time</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(160,10%,40%)" />
                            <YAxis yAxisId="left" domain={[0, 8]} label={{ value: "Yield (t/ha)", angle: -90, position: "insideLeft", style: { fontSize: 10 } }} tick={{ fontSize: 11 }} />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 1.2]} label={{ value: "NDVI", angle: 90, position: "insideRight", style: { fontSize: 10 } }} tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                                labelFormatter={(l) => `Date: ${l}`}
                            />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line yAxisId="left" type="monotone" dataKey="yield" name="Yield (t/ha)" stroke="hsl(145,63%,32%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(145,63%,32%)" }} />
                            <Line yAxisId="right" type="monotone" dataKey="ndvi" name="NDVI" stroke="hsl(38,92%,50%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── History Table ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                {sorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <History className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm">No predictions yet.</p>
                        <p className="text-xs mt-1">Use the Yield Prediction module or add entries manually.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    {["Date", "Crop", "District", "Rainfall", "Temp", "Humidity", "NDVI", "Yield"].map(h => (
                                        <th key={h} className="py-3 px-3 text-left text-muted-foreground font-semibold text-xs uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {sorted.map((e, i) => (
                                        <motion.tr
                                            key={e.id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 12 }}
                                            transition={{ delay: i * 0.04 }}
                                            className="border-t border-border/50 hover:bg-muted/40 transition-colors"
                                        >
                                            <td className="py-2.5 px-3 text-muted-foreground text-xs">{e.date.slice(0, 10)}</td>
                                            <td className="py-2.5 px-3 text-foreground font-medium">{e.crop}</td>
                                            <td className="py-2.5 px-3 text-muted-foreground">{e.district}</td>
                                            <td className="py-2.5 px-3 text-muted-foreground">{e.rainfall}mm</td>
                                            <td className="py-2.5 px-3 text-muted-foreground">{e.temperature}°C</td>
                                            <td className="py-2.5 px-3 text-muted-foreground">{e.humidity}%</td>
                                            <td className="py-2.5 px-3">
                                                <span className="font-mono text-foreground">{ndviStatus(e.ndvi)} {e.ndvi.toFixed(3)}</span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="font-bold text-primary">{e.yield.toFixed(2)} t/ha</span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Summary Stats ─────────────────────────────────────────── */}
            {history.length > 0 && (() => {
                const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
                const yields = history.map(e => e.yield);
                const ndvis = history.map(e => e.ndvi);
                return (
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Avg Yield", value: `${avg(yields).toFixed(2)} t/ha`, color: "text-primary" },
                            { label: "Best Yield", value: `${Math.max(...yields).toFixed(2)} t/ha`, color: "text-green-600" },
                            { label: "Avg NDVI", value: avg(ndvis).toFixed(3), color: "text-yellow-600" },
                        ].map(s => (
                            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
                                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
};

export default PredictionHistory;
