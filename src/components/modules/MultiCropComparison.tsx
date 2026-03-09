/**
 * MultiCropComparison.tsx  — Module 7
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Compare Rice, Wheat, Maize (and more) side by side
 *  • Metrics: expected yield, risk level, price, estimated profit
 *  • Bar chart comparison
 *  • Star ratings for each crop
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Star } from "lucide-react";
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, Tooltip, BarChart, Bar, XAxis,
    YAxis, CartesianGrid, Legend, Cell
} from "recharts";

/* ── Crop data ─────────────────────────────────────────────────────── */
interface CropProfile {
    id: string;
    name: string;
    emoji: string;
    yield: number;   // t/ha average
    price: number;   // ₹ per ton
    riskScore: number;   // 1=low risk to 5=high risk
    waterNeed: number;   // mm/season
    growthDays: number;   // days to harvest
    profitScore: number;   // 1-10
    color: string;
}

const ALL_CROPS: CropProfile[] = [
    { id: "rice", name: "Rice", emoji: "🌾", yield: 3.8, price: 20000, riskScore: 3, waterNeed: 1200, growthDays: 130, profitScore: 6, color: "#16a34a" },
    { id: "wheat", name: "Wheat", emoji: "🌿", yield: 3.2, price: 21500, riskScore: 2, waterNeed: 450, growthDays: 120, profitScore: 7, color: "#f59e0b" },
    { id: "maize", name: "Maize", emoji: "🌽", yield: 5.5, price: 17000, riskScore: 2, waterNeed: 500, growthDays: 90, profitScore: 8, color: "#f97316" },
    { id: "cotton", name: "Cotton", emoji: "🤍", yield: 2.1, price: 60000, riskScore: 4, waterNeed: 700, growthDays: 180, profitScore: 7, color: "#8b5cf6" },
    { id: "soybean", name: "Soybean", emoji: "🫘", yield: 2.6, price: 42000, riskScore: 3, waterNeed: 450, growthDays: 100, profitScore: 7, color: "#06b6d4" },
    { id: "sugarcane", name: "Sugarcane", emoji: "🌱", yield: 70, price: 3200, riskScore: 3, waterNeed: 1500, growthDays: 365, profitScore: 6, color: "#ec4899" },
];

const RISK_LABELS: Record<number, string> = { 1: "Very Low", 2: "Low", 3: "Medium", 4: "High", 5: "Very High" };
const RISK_COLORS: Record<number, string> = { 1: "text-green-600", 2: "text-emerald-600", 3: "text-yellow-600", 4: "text-orange-600", 5: "text-red-600" };

/* ── Star rating mini-component ─────────────────────────────────────── */
const Stars = ({ score, max = 10 }: { score: number; max?: number }) => {
    const stars = Math.round((score / max) * 5);
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= stars ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
            ))}
        </div>
    );
};

/* ── Component ─────────────────────────────────────────────────────── */
const MultiCropComparison = () => {
    const [selected, setSelected] = useState<string[]>(["rice", "wheat", "maize"]);
    const [chartType, setChartType] = useState<"bar" | "radar">("bar");

    const toggleCrop = (id: string) => {
        setSelected(prev =>
            prev.includes(id)
                ? prev.length > 1 ? prev.filter(c => c !== id) : prev   // keep at least 1
                : [...prev, id]
        );
    };

    const shownCrops = ALL_CROPS.filter(c => selected.includes(c.id));

    /* radar data */
    const radarData = [
        { metric: "Yield", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: Math.min(c.yield / 7 * 10, 10) }), {}) },
        { metric: "Price", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: Math.min(c.price / 7000, 10) }), {}) },
        { metric: "Safety", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: (6 - c.riskScore) * 2 }), {}) },
        { metric: "Profit", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: c.profitScore }), {}) },
        { metric: "Water Eff.", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: Math.max(1, 10 - c.waterNeed / 200) }), {}) },
        { metric: "Quick Harvest", ...shownCrops.reduce((a, c) => ({ ...a, [c.name]: Math.max(1, 10 - c.growthDays / 40) }), {}) },
    ];

    const barData = shownCrops.map(c => ({
        name: c.name,
        "Yield (t/ha)": c.yield,
        "Profit Score": c.profitScore,
        color: c.color,
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <GitCompare className="w-6 h-6 text-indigo-500" />
                    Multi-Crop Comparison Tool
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Compare crops by yield, profit, risk, and water requirements to make the best selection.
                </p>
            </div>

            {/* ── Crop Selector ────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Select Crops to Compare</h3>
                <div className="flex flex-wrap gap-2">
                    {ALL_CROPS.map(crop => (
                        <button
                            key={crop.id}
                            onClick={() => toggleCrop(crop.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${selected.includes(crop.id)
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted text-muted-foreground hover:border-primary/50"
                                }`}
                        >
                            {crop.emoji} {crop.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Comparison Table ─────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Metric</th>
                                {shownCrops.map(c => (
                                    <th key={c.id} className="py-3 px-4 text-center">
                                        <span className="text-lg">{c.emoji}</span>
                                        <p className="text-foreground font-semibold text-sm">{c.name}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: "Avg Yield", render: (c: CropProfile) => `${c.yield} t/ha`, highlight: true },
                                { label: "Market Price", render: (c: CropProfile) => `₹${c.price.toLocaleString("en-IN")}/t`, highlight: false },
                                { label: "Gross Income (1 ha)", render: null, highlight: false },
                                { label: "Risk Level", render: null, highlight: false },
                                { label: "Profit Score", render: null, highlight: false },
                                { label: "Water Need", render: (c: CropProfile) => `${c.waterNeed} mm/season`, highlight: false },
                                { label: "Growth Days", render: (c: CropProfile) => `${c.growthDays} days`, highlight: false },
                            ].map((row, ri) => (
                                <tr key={ri} className={`border-t border-border/50 ${ri % 2 === 0 ? "" : "bg-muted/30"}`}>
                                    <td className="py-3 px-4 text-muted-foreground font-medium">{row.label}</td>
                                    {shownCrops.map(c => (
                                        <td key={c.id} className="py-3 px-4 text-center">
                                            {row.label === "Gross Income (1 ha)" ? (
                                                <span className="font-bold text-green-600">
                                                    ₹{(c.yield * c.price).toLocaleString("en-IN")}
                                                </span>
                                            ) : row.label === "Risk Level" ? (
                                                <span className={`font-medium ${RISK_COLORS[c.riskScore]}`}>
                                                    {RISK_LABELS[c.riskScore]}
                                                </span>
                                            ) : row.label === "Profit Score" ? (
                                                <div className="flex justify-center">
                                                    <Stars score={c.profitScore} />
                                                </div>
                                            ) : (
                                                <span className={row.highlight ? "font-bold text-foreground" : "text-foreground"}>
                                                    {row.render ? row.render(c) : ""}
                                                </span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Chart toggle ─────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Visual Comparison</h3>
                    <div className="flex gap-2">
                        {(["bar", "radar"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setChartType(t)}
                                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors capitalize ${chartType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    }`}
                            >
                                {t} chart
                            </button>
                        ))}
                    </div>
                </div>

                {chartType === "bar" ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="Yield (t/ha)" radius={[4, 4, 0, 0]}>
                                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Bar>
                            <Bar dataKey="Profit Score" fill="#6366f1" opacity={0.7} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                            {shownCrops.map(c => (
                                <Radar
                                    key={c.id}
                                    name={c.name}
                                    dataKey={c.name}
                                    stroke={c.color}
                                    fill={c.color}
                                    fillOpacity={0.18}
                                    strokeWidth={2}
                                />
                            ))}
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Recommendation banner ─────────────────────────────────── */}
            {shownCrops.length > 0 && (() => {
                const best = shownCrops.reduce((a, b) => b.profitScore > a.profitScore ? b : a);
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/30 rounded-xl p-5"
                    >
                        <p className="font-semibold text-green-700 text-sm">
                            🏆 Best Choice for This Season: <span className="text-lg">{best.emoji}</span> {best.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Highest profit score ({best.profitScore}/10) with {RISK_LABELS[best.riskScore].toLowerCase()} risk and estimated gross income of{" "}
                            <strong>₹{(best.yield * best.price).toLocaleString("en-IN")}/ha</strong>.
                        </p>
                    </motion.div>
                );
            })()}
        </div>
    );
};

export default MultiCropComparison;
