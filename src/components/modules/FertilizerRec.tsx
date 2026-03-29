/**
 * FertilizerRec.tsx  — Module 6
 * ─────────────────────────────────────────────────────────────────────
 * Features:
 *  • Input: NDVI value + soil type (clay / sandy / loamy / silt)
 *  • Rules engine suggests fertilizers based on combination
 *  • Shows application schedule, dosage, and tips
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, Leaf, Check, ChevronRight, Loader2 } from "lucide-react";
import { yieldService } from "../../services/api";

/* ── Fertilizer rule engine ───────────────────────────────────────── */
interface FertRec {
    name: string;
    type: string;
    dose: string;
    interval: string;
    benefit: string;
    color: string;
    emoji: string;
}

type SoilType = "clay" | "sandy" | "loamy" | "silt";
type NDVILevel = "poor" | "moderate" | "healthy";

const getRecs = (ndviLevel: NDVILevel, soil: SoilType): FertRec[] => {
    const base: Record<NDVILevel, FertRec[]> = {
        poor: [
            { name: "Urea (Nitrogen)", type: "Chemical", dose: "120 kg/ha", interval: "Every 3 weeks", benefit: "Boosts leaf growth and chlorophyll", color: "bg-blue-500/10 border-blue-500/30", emoji: "🧪" },
            { name: "DAP (Diammonium Phosphate)", type: "Chemical", dose: "80 kg/ha", interval: "At sowing", benefit: "Promotes root development", color: "bg-purple-500/10 border-purple-500/30", emoji: "💊" },
            { name: "Organic Compost", type: "Organic", dose: "5 ton/ha", interval: "Pre-season", benefit: "Improves soil structure and moisture", color: "bg-amber-500/10 border-amber-500/30", emoji: "🌱" },
        ],
        moderate: [
            { name: "NPK 19-19-19", type: "Balanced", dose: "60 kg/ha", interval: "Every 4 weeks", benefit: "All-round nutrition for moderate growth", color: "bg-green-500/10 border-green-500/30", emoji: "⚖️" },
            { name: "Potassium Sulfate (SOP)", type: "Chemical", dose: "40 kg/ha", interval: "Every 6 weeks", benefit: "Improves drought resistance", color: "bg-cyan-500/10 border-cyan-500/30", emoji: "🧬" },
        ],
        healthy: [
            { name: "Top-dress Urea", type: "Maintenance", dose: "30 kg/ha", interval: "Every 6 weeks", benefit: "Maintain current health and yield", color: "bg-emerald-500/10 border-emerald-500/30", emoji: "✅" },
            { name: "Foliar Micronutrients", type: "Spray", dose: "2 L/ha spray", interval: "Monthly", benefit: "Address trace element deficiencies", color: "bg-teal-500/10 border-teal-500/30", emoji: "🌿" },
        ],
    };

    const soilAddons: Record<SoilType, FertRec[]> = {
        sandy: [{ name: "Mulch + Compost", type: "Soil Amendment", dose: "3 ton/ha", interval: "Pre-season", benefit: "Sandy soil loses nutrients fast — organic matter retention", color: "bg-yellow-500/10 border-yellow-500/30", emoji: "🏜️" }],
        clay: [{ name: "Gypsum (Calcium Sulfate)", type: "Soil Amendment", dose: "200 kg/ha", interval: "Annual", benefit: "Breaks clay hardpan, improves drainage", color: "bg-orange-500/10 border-orange-500/30", emoji: "🪨" }],
        loamy: [],
        silt: [{ name: "Phosphate Rock", type: "Slow-release", dose: "50 kg/ha", interval: "Pre-season", benefit: "Silt soils benefit from slow-release P", color: "bg-rose-500/10 border-rose-500/30", emoji: "⛏️" }],
    };

    return [...base[ndviLevel], ...soilAddons[soil]];
};

const ndviToLevel = (v: number): NDVILevel =>
    v < 0.3 ? "poor" : v <= 0.6 ? "moderate" : "healthy";

const FertilizerRec = () => {
    const [ndviInput, setNdviInput] = useState("0.42");
    const [soil, setSoil] = useState<SoilType>("loamy");
    const [showRecs, setShowRecs] = useState(false);
    const [loading, setLoading] = useState(false);
    const [backendRecs, setBackendRecs] = useState<any[]>([]);

    const handleGetRecommendations = async () => {
        setLoading(true);
        setShowRecs(false);
        const ndviVal = parseFloat(ndviInput) || 0;
        try {
            const data = await yieldService.calculateFertilizer(ndviVal);
            setBackendRecs(data.recommendations || []);
            setShowRecs(true);
        } catch (error) {
            console.error("Backend fertilizer fail, using local rules", error);
            setBackendRecs([]);
            setShowRecs(true);
        } finally {
            setLoading(false);
        }
    };

    const ndvi = parseFloat(ndviInput) || 0;
    const level = ndviToLevel(ndvi);
    const localRecs = getRecs(level, soil);
    
    // We add the backend response to the list if available
    const recs = backendRecs.length > 0 
        ? [...backendRecs.map(r => ({
            name: r.name,
            type: "Backend Suggestion",
            dose: r.dose,
            interval: "Immediate",
            benefit: "Calculated by AI model",
            color: "bg-indigo-500/10 border-indigo-500/30",
            emoji: "🤖"
        })), ...localRecs]
        : localRecs;

    const levelBadge =
        level === "poor" ? "🔴 Poor — high fertilizer need" :
            level === "moderate" ? "🟡 Moderate — balanced fertilization" :
                "🟢 Healthy — maintenance only";

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <FlaskConical className="w-6 h-6 text-violet-500" />
                    Fertilizer Recommendation Tool
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                    Get fertilizer suggestions based on NDVI health status and soil type.
                </p>
            </div>

            {/* ── Input Section ───────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                    {/* NDVI */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5 text-green-600" /> NDVI Value (0–1)
                        </label>
                        <input
                            type="range" min="0" max="1" step="0.01"
                            value={ndviInput}
                            onChange={(e) => { setNdviInput(e.target.value); setShowRecs(false); }}
                            className="w-full accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0 Poor</span><span>0.5</span><span>1 Healthy</span>
                        </div>
                        <p className="text-center text-lg font-bold text-foreground mt-2 font-mono">{parseFloat(ndviInput).toFixed(2)}</p>
                        <p className="text-center text-xs mt-1 text-muted-foreground">{levelBadge}</p>
                    </div>

                    {/* Soil Type */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Soil Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["clay", "sandy", "loamy", "silt"] as SoilType[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setSoil(s); setShowRecs(false); }}
                                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${soil === s
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted text-muted-foreground border-border hover:border-primary"
                                        }`}
                                >
                                    {s === "clay" ? "🏺" : s === "sandy" ? "🏜️" : s === "loamy" ? "🌾" : "💧"} {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {loading ? "Analyzing..." : "Get Recommendations"}
                </button>
            </div>

            {/* ── Results ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {showRecs && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        <p className="text-sm font-medium text-muted-foreground">
                            📋 {recs.length} recommendation{recs.length !== 1 ? "s" : ""} for{" "}
                            <strong className="text-foreground capitalize">{soil} soil</strong> with{" "}
                            NDVI <strong className="text-foreground">{ndvi.toFixed(2)}</strong>
                        </p>

                        {recs.map((rec, i) => (
                            <motion.div
                                key={rec.name}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`rounded-xl border p-4 ${rec.color}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{rec.emoji}</span>
                                        <div>
                                            <p className="font-semibold text-foreground text-sm">{rec.name}</p>
                                            <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-background/60 text-muted-foreground border border-border mt-0.5">
                                                {rec.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-foreground">{rec.dose}</p>
                                        <p className="text-xs text-muted-foreground">{rec.interval}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary" />
                                    {rec.benefit}
                                </div>
                            </motion.div>
                        ))}

                        {/* General tips */}
                        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground space-y-1.5">
                            <p className="font-semibold text-foreground text-sm mb-2">💡 General Best Practices</p>
                            <p>• Always do a soil test before heavy fertilizer application.</p>
                            <p>• Apply fertilizer in the morning or evening to reduce evaporation loss.</p>
                            <p>• Avoid over-fertilizing — it causes nutrient burnout and water pollution.</p>
                            <p>• Combine organic + chemical fertilizers for long-term soil health.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FertilizerRec;
