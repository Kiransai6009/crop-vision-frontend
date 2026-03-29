import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Satellite, Leaf, CloudRain, AlertTriangle,
  DollarSign, FlaskConical, GitCompare, History, Map,
  Microscope, IndianRupee, Layers, LayoutGrid
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

const TABS = [
  { id: "yield", label: "Yield", icon: Satellite, component: YieldPrediction, badge: null },
  { id: "satellite", label: "Satellite Analysis", icon: Layers, component: SatelliteAnalysis, badge: "NEW" },
  { id: "health", label: "Crop Health", icon: Leaf, component: CropHealthMonitor, badge: null },
  { id: "weather", label: "Weather", icon: CloudRain, component: WeatherDashboard, badge: "LIVE" },
  { id: "disease", label: "Disease AI", icon: Microscope, component: DiseaseDetection, badge: "NEW" },
  { id: "market", label: "Market", icon: IndianRupee, component: MarketPrices, badge: "NEW" },
  { id: "risk", label: "Risk Alerts", icon: AlertTriangle, component: RiskAlertSystem, badge: null },
  { id: "profit", label: "Profit", icon: DollarSign, component: ProfitEstimation, badge: null },
  { id: "fertilizer", label: "Fertilizer", icon: FlaskConical, component: FertilizerRec, badge: null },
  { id: "comparison", label: "Compare", icon: GitCompare, component: MultiCropComparison, badge: null },
  { id: "history", label: "History", icon: History, component: PredictionHistory, badge: null },
  { id: "heatmap", label: "Heatmap", icon: Map, component: DistrictHeatmap, badge: null },
] as const;

type TabId = typeof TABS[number]["id"];

const ModulesDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("yield");
  const ActiveComponent = TABS.find(t => t.id === activeTab)!.component;

  return (
    <div className="flex flex-col gap-4 relative z-20">
      {/* ── Page Header (Compact) ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/10 pb-3">
        <div>
          <h1 className="font-display text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
             <LayoutGrid className="w-6 h-6 text-primary" />
             <span>Feature Core</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Access 12 powerful analytical modules for crop intelligence.
          </p>
        </div>
      </div>

      {/* ── Tab Navigation (Compact) ── */}
      <nav className="p-1 px-1.5 flex gap-1 overflow-x-auto no-scrollbar bg-card/40 backdrop-blur-md rounded-xl border border-border shadow-sm">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-3 py-2 text-[10px] font-bold whitespace-nowrap
                rounded-lg transition-all duration-300 group
                ${isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground scale-95"
                }
              `}
            >
              <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-black" : "text-primary/70"}`} />
              {tab.label}
              {tab.badge && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ml-1 ${
                    tab.badge === "LIVE" ? "bg-red-500 text-white animate-pulse" :
                    tab.badge === "NEW" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}>{tab.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Active Module Rendering ── */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModulesDashboard;
