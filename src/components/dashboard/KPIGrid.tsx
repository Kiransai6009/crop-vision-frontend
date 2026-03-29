import { motion } from "framer-motion";
import { Wheat, Leaf, Thermometer, CloudRain } from "lucide-react";

interface KPIGridProps {
  loading: boolean;
  data: any;
}

const StatCard = ({
  icon: Icon, label, value, sub, color, delay
}: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="p-6 rounded-2xl glass-card border flex flex-col justify-between border-border/40 hover:border-border/80 hover:bg-muted/10 transition-all duration-500 group relative overflow-hidden"
  >
    {/* Background Glow */}
    <div className={`absolute -right-6 -top-6 w-24 h-24 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${color.split(' ')[0]}`} />
    
    <div className="flex items-start justify-between mb-4 relative z-10">
      <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${color}`}>
        <Icon className="w-5 h-5 xl:w-6 xl:h-6" />
      </div>
      <span className="text-xs xl:text-sm font-medium px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground border border-border/50">
        {sub}
      </span>
    </div>
    <div className="relative z-10">
      <div className="font-display font-bold text-3xl xl:text-4xl text-foreground tracking-tight mb-1">
        {value}
      </div>
      <div className="text-sm xl:text-base font-medium text-muted-foreground">{label}</div>
    </div>
  </motion.div>
);

export const KPIGrid = ({ loading, data }: KPIGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-8">
      <StatCard
        icon={Wheat}
        label="Predicted Yield"
        value={loading ? "..." : `${data?.yield?.predicted || "4.7"} t/ha`}
        sub="2025 Prediction"
        color="bg-primary text-primary-foreground shadow-primary/30"
        delay={0.1}
      />
      <StatCard
        icon={Leaf}
        label="Current NDVI"
        value={loading ? "..." : (data?.ndvi_value || "0.78").toString()}
        sub={data?.crop_health || "Healthy"}
        color="bg-chart-4 text-chart-4-foreground shadow-chart-4/30"
        delay={0.2}
      />
      <StatCard
        icon={Thermometer}
        label="Avg Temperature"
        value={loading ? "..." : `${data?.temperature || "28"}°C`}
        sub="Real-time Data"
        color="bg-secondary text-secondary-foreground shadow-secondary/30"
        delay={0.3}
      />
      <StatCard
        icon={CloudRain}
        label="Rainfall Accumulation"
        value={loading ? "..." : `${data?.rainfall || "850"} mm`}
        sub="Current Season"
        color="bg-accent text-accent-foreground shadow-accent/30"
        delay={0.4}
      />
    </div>
  );
};
