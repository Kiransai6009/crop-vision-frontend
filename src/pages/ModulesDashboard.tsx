/**
 * ModulesDashboard.tsx
 * ─────────────────────────────────────────────
 * Main page housing all 12 feature modules via a tab navigation bar.
 *
 * Modules:
 *  1. Yield Prediction        7. Multi-Crop Comparison
 *  2. Crop Health Monitoring  8. Prediction History
 *  3. Weather Dashboard       9. District Heatmap
 *  4. Risk Alert System      10. Satellite Analysis (NEW)
 *  5. Profit Estimation      11. Disease Detection (NEW)
 *  6. Fertilizer Rec         12. Market Prices (NEW)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Satellite, Leaf, CloudRain, AlertTriangle,
  DollarSign, FlaskConical, GitCompare, History, Map,
  Microscope, IndianRupee, Layers
} from "lucide-react";

import YieldPrediction from "@/components/modules/YieldPrediction";
import CropHealthMonitor from "@/components/modules/CropHealthMonitor";
import WeatherDashboard from "@/components/modules/WeatherDashboard";
import RiskAlertSystem from "@/components/modules/RiskAlertSystem";
import ProfitEstimation from "@/components/modules/ProfitEstimation";
import FertilizerRec from "@/components/modules/FertilizerRec";
import MultiCropComparison from "@/components/modules/MultiCropComparison";
import PredictionHistory from "@/components/modules/PredictionHistory";
import DistrictHeatmap from "@/components/modules/DistrictHeatmap";
import SatelliteAnalysis from "@/components/modules/SatelliteAnalysis";
import DiseaseDetection from "@/components/modules/DiseaseDetection";
import MarketPrices from "@/components/modules/MarketPrices";

/* ── Tab Definitions ───────────────────────────────────────────────── */
const TABS = [
  { id: "yield", label: "Yield Prediction", icon: Satellite, component: YieldPrediction, badge: null },
  { id: "satellite", label: "Satellite Analysis", icon: Layers, component: SatelliteAnalysis, badge: "NEW" },
  { id: "health", label: "Crop Health", icon: Leaf, component: CropHealthMonitor, badge: null },
  { id: "weather", label: "Weather", icon: CloudRain, component: WeatherDashboard, badge: "LIVE" },
  { id: "disease", label: "Disease AI", icon: Microscope, component: DiseaseDetection, badge: "NEW" },
  { id: "market", label: "Market Prices", icon: IndianRupee, component: MarketPrices, badge: "NEW" },
  { id: "risk", label: "Risk Alerts", icon: AlertTriangle, component: RiskAlertSystem, badge: null },
  { id: "profit", label: "Profit Estimator", icon: DollarSign, component: ProfitEstimation, badge: null },
  { id: "fertilizer", label: "Fertilizer", icon: FlaskConical, component: FertilizerRec, badge: null },
  { id: "comparison", label: "Crop Comparison", icon: GitCompare, component: MultiCropComparison, badge: null },
  { id: "history", label: "History", icon: History, component: PredictionHistory, badge: null },
  { id: "heatmap", label: "Heatmap", icon: Map, component: DistrictHeatmap, badge: null },
] as const;

type TabId = typeof TABS[number]["id"];

/* ── Page Component ────────────────────────────────────────────────── */
const ModulesDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("yield");

  const ActiveComponent = TABS.find(t => t.id === activeTab)!.component;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 h-14">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Satellite className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">Crop Insight</span>
              <span className="text-muted-foreground text-sm ml-1">/ All Modules</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Tab Bar ──────────────────────────────────────────────── */}
      <nav className="bg-card border-b border-border overflow-x-auto scrollbar-none">
        <div className="flex px-4 gap-1 min-w-max">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  border-b-2 transition-all duration-200
                  ${isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${tab.badge === "LIVE" ? "bg-green-500 text-white" :
                      tab.badge === "NEW" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Active Module ─────────────────────────────────────────── */}
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ModulesDashboard;
