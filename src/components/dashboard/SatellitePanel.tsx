import { motion } from "framer-motion";
import { Satellite, Fingerprint, Layers } from "lucide-react";

interface SatellitePanelProps {
  ndviValue: number;
  cropHealthStatus: string;
}

export const SatellitePanel = ({ ndviValue, cropHealthStatus }: SatellitePanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 rounded-3xl glass-card border flex flex-col justify-between border-border/40 shadow-lg relative overflow-hidden h-full group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          Sentinel-2 Data
        </h3>
        <span className="text-xs bg-primary/20 text-primary font-semibold px-2.5 py-1 rounded-full border border-primary/20">
          Live Feed
        </span>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden bg-muted border border-border/50 mb-4 group h-[180px] min-h-[180px]">
        {/* Mock Satellite Image overlay with CSS */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595867451610-86ec16071ef6?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 blur-[1px] group-hover:blur-none opacity-60 mix-blend-luminosity" />
        <div className="absolute inset-0 backdrop-saturate-150 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        
        {/* Overlay Stats */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3" /> Filter: NIR + Red
            </p>
            <p className="text-xl font-display font-bold text-white drop-shadow-md">
              NDVI {ndviValue}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90">
            <Fingerprint className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="p-3 rounded-xl bg-card border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Crop Health</p>
          <p className="font-semibold text-sm text-foreground">{cropHealthStatus}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Resolution</p>
          <p className="font-semibold text-sm text-foreground">10m / px</p>
        </div>
      </div>
    </motion.div>
  );
};
