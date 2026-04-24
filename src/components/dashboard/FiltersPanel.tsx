import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
          <Select value={selectedCrop} onValueChange={onCropChange}>
            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {crops.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            State
          </label>
          <Select value={selectedState} onValueChange={onStateChange}>
            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            District / Region
          </label>
          <Select value={selectedDistrict} onValueChange={onDistrictChange}>
            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-border/50 text-foreground font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
