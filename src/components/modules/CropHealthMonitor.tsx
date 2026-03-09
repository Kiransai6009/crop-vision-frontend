/**
 * CropHealthMonitor.tsx  — Module 2
 * ─────────────────────────────────────────────────────────────────────
 * Displays crop health status based on NDVI value.
 *   NDVI > 0.6   → 🟢 Healthy
 *   NDVI 0.3–0.6 → 🟡 Moderate
 *   NDVI < 0.3   → 🔴 Poor
 *
 * Also shows a visual gauge and monthly NDVI trend chart.
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, TrendingUp } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

/* ── Static NDVI trend data for the chart ─────────────────────────── */
const TREND_DATA = [
    { month: "Jan", ndvi: 0.21 }, { month: "Feb", ndvi: 0.28 },
    { month: "Mar", ndvi: 0.45 }, { month: "Apr", ndvi: 0.62 },
    { month: "May", ndvi: 0.78 }, { month: "Jun", ndvi: 0.85 },
    { month: "Jul", ndvi: 0.82 }, { month: "Aug", ndvi: 0.73 },
    { month: "Sep", ndvi: 0.58 }, { month: "Oct", ndvi: 0.39 },
    { month: "Nov", ndvi: 0.27 }, { month: "Dec", ndvi: 0.22 },
];

/* ── Health classification helper ────────────────────────────────────── */
const getHealth = (ndvi: number) => {
    if (ndvi > 0.6) return { label: "Healthy", color: "text-green-600", bg: "bg-green-600/10", border: "border-green-600/30", fill: "#16a34a", emoji: "🟢", tips: ["Excellent canopy cover detected.", "Continue current irrigation schedule.", "No immediate intervention needed."] };
    if (ndvi >= 0.3) return { label: "Moderate", color: "text-yellow-600", bg: "bg-yellow-500/10", border: "border-yellow-500/30", fill: "#ca8a04", emoji: "🟡", tips: ["Partial stress detected in crop area.", "Consider supplemental irrigation.", "Monitor closely over next 2 weeks."] };
    return { label: "Poor", color: "text-red-600", bg: "bg-red-600/10", border: "border-red-600/30", fill: "#dc2626", emoji: "🔴", tips: ["Severe crop stress or bare soil detected.", "Immediate irrigation recommended.", "Check for pest damage or disease."] };
};

/* ── NDVI Speedometer Gauge (SVG) ─────────────────────────────────────
   Proper arc-sweep needle gauge:
   • Semi-circle viewBox 0 0 200 120
   • cx=100, cy=105, r=80
   • Arc spans 180° from 9 o'clock (left) to 3 o'clock (right)
   • Needle rotates around (cx, cy) from -90° (left) to +90° (right)
   • 0 → needle points left  |  1 → needle points right
 ────────────────────────────────────────────────────────────────────── */
const NDVIGauge = ({ ndvi }: { ndvi: number }) => {
    const pct = Math.max(0, Math.min(1, ndvi));
    const cx = 100;
    const cy = 105;
    const R = 78;            // arc radius
    const SW = 16;            // stroke width of arc track

    // ── arc geometry helpers ─────────────────────────────────────────
    // angle: 0° = right, 90° = down.  Our arc: 180° → 0° (left → right)
    const polarToXY = (angleDeg: number, radius: number) => {
        const rad = (angleDeg * Math.PI) / 180;
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
    };

    // Three colour zones: poor 0→0.3, moderate 0.3→0.6, healthy 0.6→1
    //   mapped to 180° → 0°  (so angleDeg = 180 - pct*180)
    const p0 = polarToXY(180, R);    // NDVI=0  (far left)
    const p03 = polarToXY(126, R);    // NDVI=0.3
    const p06 = polarToXY(72, R);     // NDVI=0.6
    const p1 = polarToXY(0, R);      // NDVI=1  (far right)

    // Build SVG arc-path segment helper
    const arcPath = (start: { x: number; y: number }, end: { x: number; y: number }, large: number) =>
        `M ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y}`;

    // ── animated fill arc (stroke-dashoffset trick) ──────────────────
    const circumference = Math.PI * R;          // half circle arc length ≈ 245
    const fillLength = pct * circumference;  // how much to fill

    // ── needle angle: maps 0→-90°, 1→+90° in standard CSS/SVG terms ─
    //   but we use SVG transform="rotate(deg, cx, cy)" directly
    //   angle = -90 + pct * 180
    const needleDeg = -90 + pct * 180;

    // ── needle length (slightly shorter than arc radius) ──────────────
    const needleLen = R - 10;

    // ── needle colour based on zone ──────────────────────────────────
    const needleColor = pct > 0.6 ? "#16a34a" : pct >= 0.3 ? "#ca8a04" : "#dc2626";

    // ── tick marks ───────────────────────────────────────────────────
    const ticks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

    return (
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] mx-auto drop-shadow-sm">
            <defs>
                {/* Glow filter for needle */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {/* Shadow for center circle */}
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#00000040" />
                </filter>
            </defs>

            {/* ── Track arcs (background) ─────────────────────────── */}
            {/* Poor zone: 0 → 0.3 */}
            <path d={arcPath(p0, p03, 0)} fill="none" stroke="#fecaca" strokeWidth={SW} strokeLinecap="butt" />
            {/* Moderate zone: 0.3 → 0.6 */}
            <path d={arcPath(p03, p06, 0)} fill="none" stroke="#fef08a" strokeWidth={SW} strokeLinecap="butt" />
            {/* Healthy zone: 0.6 → 1 */}
            <path d={arcPath(p06, p1, 0)} fill="none" stroke="#bbf7d0" strokeWidth={SW} strokeLinecap="butt" />

            {/* ── Active fill arc (animated sweep) ───────────────── */}
            {/* Uses a single half-circle path with dasharray animation */}
            <motion.path
                d={arcPath(p0, p1, 1)}
                fill="none"
                stroke={needleColor}
                strokeWidth={SW - 4}
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - fillLength, stroke: needleColor }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                opacity={0.85}
            />

            {/* ── Tick marks ─────────────────────────────────────── */}
            {ticks.map(t => {
                const a = 180 - t * 180;
                const inner = polarToXY(a, R - SW / 2 - 1);
                const outer = polarToXY(a, R + SW / 2 + 1);
                const isMajor = [0, 0.3, 0.6, 1].includes(t);
                return (
                    <line
                        key={t}
                        x1={inner.x} y1={inner.y}
                        x2={outer.x} y2={outer.y}
                        stroke={isMajor ? "#6b7280" : "#9ca3af"}
                        strokeWidth={isMajor ? 2 : 1}
                    />
                );
            })}

            {/* ── Needle (animated rotation via SVG transform) ──── */}
            <motion.g
                initial={{ rotate: -90, originX: `${cx}px`, originY: `${cy}px` }}
                animate={{ rotate: needleDeg, originX: `${cx}px`, originY: `${cy}px` }}
                transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
                filter="url(#glow)"
            >
                {/* Needle shadow line */}
                <line
                    x1={cx} y1={cy + 2}
                    x2={cx} y2={cy - needleLen + 8}
                    stroke="#00000030"
                    strokeWidth={5}
                    strokeLinecap="round"
                />
                {/* Needle body */}
                <line
                    x1={cx} y1={cy + 6}
                    x2={cx} y2={cy - needleLen + 8}
                    stroke={needleColor}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                />
                {/* Needle tail (opposite stub) */}
                <line
                    x1={cx} y1={cy + 6}
                    x2={cx} y2={cy + 12}
                    stroke={needleColor}
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.4}
                />
            </motion.g>

            {/* ── Center pivot circle ─────────────────────────────── */}
            <circle cx={cx} cy={cy} r={9} fill="#1f2937" filter="url(#shadow)" />
            <motion.circle
                cx={cx} cy={cy} r={5}
                fill={needleColor}
                animate={{ fill: needleColor }}
                transition={{ duration: 0.6 }}
            />
            <circle cx={cx} cy={cy} r={2} fill="#f9fafb" />

            {/* ── Zone labels ─────────────────────────────────────── */}
            <text x="14" y="118" fontSize="8.5" fill="#dc2626" textAnchor="middle" fontWeight="600">Poor</text>
            <text x="100" y="10" fontSize="8.5" fill="#ca8a04" textAnchor="middle" fontWeight="600">Moderate</text>
            <text x="186" y="118" fontSize="8.5" fill="#16a34a" textAnchor="middle" fontWeight="600">Healthy</text>

            {/* ── NDVI numeric value ───────────────────────────────── */}
            <motion.text
                x={cx} y={cy - 20}
                fontSize="17"
                fontWeight="bold"
                textAnchor="middle"
                fill={needleColor}
                animate={{ fill: needleColor }}
                transition={{ duration: 0.5 }}
            >
                {ndvi.toFixed(3)}
            </motion.text>
            <text x={cx} y={cy - 8} fontSize="7.5" textAnchor="middle" fill="#9ca3af" letterSpacing="1">NDVI</text>
        </svg>
    );
};

/* ── Component ─────────────────────────────────────────────────────── */
const CropHealthMonitor = () => {
    const [ndviInput, setNdviInput] = useState("0.72");
    const ndvi = parseFloat(ndviInput) || 0;
    const health = getHealth(ndvi);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-green-600" />
                    Crop Health Monitoring
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Real-time crop health assessment based on NDVI (Normalized Difference Vegetation Index).
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ── Left: NDVI Input + Gauge ─────────────────────────── */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Enter NDVI Value</h3>

                    {/* Slider + number input */}
                    <div>
                        <input
                            type="range" min="0" max="1" step="0.001"
                            value={ndviInput}
                            onChange={(e) => setNdviInput(e.target.value)}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0 (Bare soil)</span>
                            <span>0.5 (Sparse veg)</span>
                            <span>1 (Dense forest)</span>
                        </div>
                        <input
                            type="number" min="0" max="1" step="0.001"
                            value={ndviInput}
                            onChange={(e) => setNdviInput(e.target.value)}
                            className="mt-3 w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm text-center font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="0.000 – 1.000"
                        />
                    </div>

                    {/* Gauge */}
                    <NDVIGauge ndvi={ndvi} />

                    {/* Status badge */}
                    <motion.div
                        key={health.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border ${health.bg} ${health.border}`}
                    >
                        <span className="text-2xl">{health.emoji}</span>
                        <div>
                            <p className={`font-bold text-lg ${health.color}`}>{health.label}</p>
                            <p className="text-xs text-muted-foreground">
                                {ndvi > 0.6 ? "NDVI > 0.6" : ndvi >= 0.3 ? "NDVI 0.3 – 0.6" : "NDVI < 0.3"}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* ── Right: Action Tips + Ranges ──────────────────────── */}
                <div className="space-y-4">
                    {/* Thresholds guide */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">NDVI Health Ranges</h3>
                        <div className="space-y-2">
                            {[
                                { range: "> 0.6", label: "🟢 Healthy", desc: "Dense, healthy vegetation", bar: "bg-green-500", pct: "85%" },
                                { range: "0.3 – 0.6", label: "🟡 Moderate", desc: "Sparse or stressed vegetation", bar: "bg-yellow-400", pct: "50%" },
                                { range: "< 0.3", label: "🔴 Poor", desc: "Bare soil or severe stress", bar: "bg-red-500", pct: "20%" },
                            ].map(row => (
                                <div key={row.range} className="flex items-center gap-3">
                                    <div className={`h-2 rounded-full ${row.bar}`} style={{ width: row.pct }} />
                                    <div className="min-w-0">
                                        <span className="text-sm font-medium text-foreground">{row.label}</span>
                                        <span className="text-xs text-muted-foreground ml-2">({row.range})</span>
                                        <p className="text-xs text-muted-foreground">{row.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tips */}
                    <motion.div
                        key={health.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`bg-card border rounded-xl p-5 ${health.border}`}
                    >
                        <h3 className="text-sm font-semibold text-foreground mb-2">Recommendations</h3>
                        <ul className="space-y-1.5">
                            {health.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-0.5 text-primary shrink-0">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* ── Monthly NDVI Trend Chart ─────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Monthly NDVI Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={TREND_DATA}>
                        <defs>
                            <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150,12%,88%)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(160,10%,40%)" />
                        <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} stroke="hsl(160,10%,40%)" />
                        <Tooltip
                            formatter={(v: number) => [v.toFixed(3), "NDVI"]}
                            contentStyle={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}
                        />
                        <ReferenceLine y={0.6} stroke="#16a34a" strokeDasharray="4 2" label={{ value: "Healthy", fontSize: 10 }} />
                        <ReferenceLine y={0.3} stroke="#dc2626" strokeDasharray="4 2" label={{ value: "Poor", fontSize: 10 }} />
                        <Area type="monotone" dataKey="ndvi" stroke="#16a34a" strokeWidth={2} fill="url(#ndviGrad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CropHealthMonitor;
