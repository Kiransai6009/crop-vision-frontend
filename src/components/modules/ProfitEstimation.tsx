/**
 * ProfitEstimation.tsx  — Module 5
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Inputs: expected yield (t/ha), area (ha), market price per ton
 *  • Calculates: total income, net profit (after estimated costs)
 *  • Cost breakdown (estimated): seeds, fertilizer, irrigation, labour
 *  • Display: animated income result + profit bar
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Calculator, IndianRupee, Info, Loader2 } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { yieldService } from "../../services/api";

/* ── Estimated cost ratios per crop (per hectare, INR) ──────────────── */
const CROP_COSTS: Record<string, { seeds: number; fertilizer: number; irrigation: number; labour: number }> = {
    "Rice": { seeds: 3500, fertilizer: 8000, irrigation: 6000, labour: 15000 },
    "Wheat": { seeds: 4000, fertilizer: 7000, irrigation: 4000, labour: 12000 },
    "Maize": { seeds: 5000, fertilizer: 9000, irrigation: 5000, labour: 13000 },
    "Cotton": { seeds: 6000, fertilizer: 12000, irrigation: 8000, labour: 18000 },
    "Soybean": { seeds: 4500, fertilizer: 7500, irrigation: 4500, labour: 11000 },
    "Other": { seeds: 4000, fertilizer: 8000, irrigation: 5000, labour: 14000 },
};

/* ── Animated counter ────────────────────────────────────────────── */
const AnimatedNumber = ({ value }: { value: number }) => (
    <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
    >
        {value.toLocaleString("en-IN")}
    </motion.span>
);

const ProfitEstimation = () => {
    const [crop, setCrop] = useState("Rice");
    const [yield_, setYield] = useState("2.8");
    const [area, setArea] = useState("1");
    const [price, setPrice] = useState("20000");
    const [calculated, setCalculated] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // State to store backend results
    const [results, setResults] = useState<{
        grossIncome: number;
        totalCost: number;
        netProfit: number;
        profitPct: number;
        totalYield: number;
    } | null>(null);

    const handleCalculate = async () => {
        const yieldPerHa = parseFloat(yield_) || 0;
        const areaHa = parseFloat(area) || 1;
        const pricePerTon = parseFloat(price) || 0;

        if (yieldPerHa <= 0 || pricePerTon <= 0) return;

        setLoading(true);
        try {
            const data = await yieldService.calculateProfit({
                yield_per_ha: yieldPerHa,
                area_ha: areaHa,
                price_per_ton: pricePerTon
            });
            
            setResults({
                grossIncome: data.gross_income,
                totalCost: data.total_cost,
                netProfit: data.net_profit,
                profitPct: Math.round((data.net_profit / data.gross_income) * 100),
                totalYield: data.total_yield_tons
            });
            setCalculated(true);
        } catch (error) {
            console.error("Profit calculation failed, using fallback", error);
            // Fallback local logic
            const totalYield = yieldPerHa * areaHa;
            const grossIncome = totalYield * pricePerTon;
            const costs = CROP_COSTS[crop] || CROP_COSTS["Other"];
            const totalCost = (costs.seeds + costs.fertilizer + costs.irrigation + costs.labour) * areaHa;
            const netProfit = grossIncome - totalCost;
            
            setResults({
                grossIncome,
                totalCost,
                netProfit,
                profitPct: Math.round((netProfit / grossIncome) * 100),
                totalYield
            });
            setCalculated(true);
        } finally {
            setLoading(false);
        }
    };

    const costs = CROP_COSTS[crop] || CROP_COSTS["Other"];
    const areaHa = parseFloat(area) || 1;
    const yieldPerHa = parseFloat(yield_) || 0;
    const pricePerTon = parseFloat(price) || 0;

    const chartData = results ? [
        { name: "Seeds", value: costs.seeds * areaHa, fill: "#6366f1" },
        { name: "Fertilizer", value: costs.fertilizer * areaHa, fill: "#f59e0b" },
        { name: "Irrigation", value: costs.irrigation * areaHa, fill: "#06b6d4" },
        { name: "Labour", value: costs.labour * areaHa, fill: "#ec4899" },
        { name: "Gross Income", value: results.grossIncome, fill: "#16a34a" },
    ] : [];


    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                    Profit Estimation Tool
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Calculate expected income and net profit based on yield, crop price, and area.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ── Inputs ───────────────────────────────────────────── */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Farm Details</h3>

                    {/* Crop selector */}
                    <label className="block">
                        <span className="text-sm text-muted-foreground mb-1 block">Crop Type</span>
                        <select
                            value={crop}
                            onChange={(e) => { setCrop(e.target.value); setCalculated(false); }}
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {Object.keys(CROP_COSTS).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </label>

                    {/* Yield per hectare */}
                    <label className="block">
                        <span className="text-sm text-muted-foreground mb-1 block">Expected Yield (tons/hectare)</span>
                        <input
                            type="number"
                            value={yield_}
                            onChange={(e) => { setYield(e.target.value); setCalculated(false); }}
                            placeholder="e.g. 2.8"
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    {/* Area */}
                    <label className="block">
                        <span className="text-sm text-muted-foreground mb-1 block">Farm Area (hectares)</span>
                        <input
                            type="number"
                            value={area}
                            onChange={(e) => { setArea(e.target.value); setCalculated(false); }}
                            placeholder="e.g. 1"
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    {/* Price per ton */}
                    <label className="block">
                        <span className="text-sm text-muted-foreground mb-1 block">Market Price per Ton (₹)</span>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => { setPrice(e.target.value); setCalculated(false); }}
                            placeholder="e.g. 20000"
                            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </label>

                    <button
                        onClick={handleCalculate}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                        {loading ? "Calculating..." : "Calculate Profit"}
                    </button>
                </div>

                {/* ── Results ──────────────────────────────────────────── */}
                <div className="space-y-3">
                    <AnimatePresence>
                        {calculated && results && yieldPerHa > 0 && pricePerTon > 0 ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-3"
                            >
                                {/* Formula display */}
                                <div className="bg-muted rounded-xl p-4 font-mono text-sm text-muted-foreground border border-border">
                                    <p>{yieldPerHa} t/ha × {areaHa} ha = <strong className="text-foreground">{results.totalYield.toFixed(2)} tons</strong></p>
                                    <p className="mt-1">{results.totalYield.toFixed(2)} tons × ₹{Number(price).toLocaleString("en-IN")} = <strong className="text-green-600">₹<AnimatedNumber value={results.grossIncome} /></strong></p>
                                </div>

                                {/* Gross Income */}
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        <p className="text-sm font-semibold text-green-700">Gross Income</p>
                                    </div>
                                    <p className="text-3xl font-display font-bold text-green-600">
                                        ₹<AnimatedNumber value={results.grossIncome} />
                                    </p>
                                </div>

                                {/* Cost + Net Profit */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                            <p className="text-xs font-semibold text-red-600">Total Cost</p>
                                        </div>
                                        <p className="text-2xl font-bold text-red-600">₹<AnimatedNumber value={results.totalCost} /></p>
                                    </div>
                                    <div className={`rounded-xl p-4 border ${results.netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <DollarSign className="w-3.5 h-3.5" />
                                            <p className={`text-xs font-semibold ${results.netProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>Net Profit</p>
                                        </div>
                                        <p className={`text-2xl font-bold ${results.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                            ₹<AnimatedNumber value={Math.abs(results.netProfit)} />
                                        </p>
                                    </div>
                                </div>

                                {/* Profit margin bar */}
                                <div className="bg-card border border-border rounded-xl p-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-muted-foreground">Profit Margin</span>
                                        <span className={`font-bold ${results.profitPct >= 0 ? "text-green-600" : "text-red-600"}`}>{results.profitPct}%</span>
                                    </div>
                                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.max(0, Math.min(100, results.profitPct))}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className={`h-full rounded-full ${results.profitPct >= 30 ? "bg-green-500" : results.profitPct >= 0 ? "bg-yellow-500" : "bg-red-500"}`}
                                        />
                                    </div>
                                </div>


                                {/* Cost breakdown info */}
                                <div className="bg-muted rounded-xl p-4 text-xs text-muted-foreground space-y-1">
                                    <div className="flex items-center gap-1 mb-2"><Info className="w-3.5 h-3.5" /> Estimated Cost Breakdown per Hectare</div>
                                    {Object.entries(costs).map(([k, v]) => (
                                        <div key={k} className="flex justify-between">
                                            <span className="capitalize">{k}</span>
                                            <span>₹{(v * areaHa).toLocaleString("en-IN")}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground h-60">
                                <IndianRupee className="w-14 h-14 mb-3 opacity-20" />
                                <p className="text-sm">Fill in farm details and click<br /><strong>Calculate Profit</strong></p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Cost vs Income Bar Chart ─────────────────────────────── */}
            {calculated && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-xl p-6"
                >
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Cost vs Income Breakdown (₹)
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                {chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </div>
    );
};

export default ProfitEstimation;
