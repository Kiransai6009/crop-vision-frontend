import { motion } from "framer-motion";
import { Sparkles, MapPin, TrendingUp, AlertTriangle } from "lucide-react";

interface PredictionHighlightProps {
  loading: boolean;
  predictedYield: string | number;
  cropName: string;
  location: string;
  status: "Good" | "Moderate" | "Poor";
}

export const PredictionHighlight = ({
  loading,
  predictedYield,
  cropName,
  location,
  status
}: PredictionHighlightProps) => {
  
  const statusColors = {
    Good: "text-green-500 bg-green-500/10 border-green-500/30",
    Moderate: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
    Poor: "text-red-500 bg-red-500/10 border-red-500/30"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-[1px] rounded-3xl bg-gradient-to-br from-primary/50 via-secondary/30 to-border overflow-hidden relative shadow-2xl shadow-primary/10"
    >
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      
      <div className="bg-background/80 backdrop-blur-2xl p-8 lg:p-10 rounded-[23px] h-full flex flex-col justify-center relative z-10">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>AI ML Prediction</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusColors[status]}`}>
            {status === "Poor" ? <AlertTriangle className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {status} Yield Expected
          </div>
        </div>

        <div className="mb-2">
          <h2 className="text-muted-foreground font-medium text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {location}
          </h2>
          <h3 className="text-2xl font-display font-semibold text-foreground mt-1">
            {cropName} Crop Analysis
          </h3>
        </div>

        <div className="mt-8 flex items-baseline gap-2">
          <span className="font-display font-bold text-7xl tracking-tighter text-foreground">
            {loading ? "-" : predictedYield}
          </span>
          <span className="text-2xl text-muted-foreground font-medium">t/ha</span>
        </div>

        <p className="mt-6 text-sm text-muted-foreground border-t border-border/50 pt-4 leading-relaxed">
          Based on our Random Forest & CNN fusion model utilizing recent Sentinel-2 satellite imagery (NDVI), historical soil profiles, and hyper-local meteorological forecasting.
        </p>

      </div>
    </motion.div>
  );
};
