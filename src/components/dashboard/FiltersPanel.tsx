import { motion } from "framer-motion";

interface FiltersPanelProps {
  crops: string[];
  states: string[];
  districts: string[];
  selectedCrop: string;
  selectedState: string;
  selectedDistrict: string;
  onCropChange: (crop: string) => void;
  onStateChange: (state: string) => void;
  onDistrictChange: (district: string) => void;
}

export const FiltersPanel = ({
  crops,
  states,
  districts,
  selectedCrop,
  selectedState,
  selectedDistrict,
  onCropChange,
  onStateChange,
  onDistrictChange,
}: FiltersPanelProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 rounded-2xl border border-border/50 shadow-lg mb-8"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Target Crop
          </label>
          <div className="relative">
            <select
              value={selectedCrop}
              onChange={(e) => onCropChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all hover:bg-muted/50"
            >
              {crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">
              ▼
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            State
          </label>
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all hover:bg-muted/50"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">
              ▼
            </div>
          </div>
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            District / Region
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-all hover:bg-muted/50"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">
              ▼
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-auto flex items-end">
          <button className="w-full md:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0">
            Analyze
          </button>
        </div>
      </div>
    </motion.div>
  );
};
