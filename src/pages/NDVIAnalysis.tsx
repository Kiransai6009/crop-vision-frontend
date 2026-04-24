import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, Leaf, TrendingDown, Activity, MapPin,
  Share2, Loader2, Zap, RefreshCw
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useLiveWeather, DISTRICT_COORDS } from "@/hooks/useLiveWeather";
import { useGlobalLocation } from "@/context/LocationContext";
import { useLocation } from "react-router-dom";

// Build state → districts map from DISTRICT_COORDS
const stateDistrictsMap = Object.entries(DISTRICT_COORDS).reduce((acc, [dist, info]) => {
  if (!acc[info.state]) acc[info.state] = [];
  acc[info.state].push(dist);
  return acc;
}, {} as Record<string, string[]>);

const states = Object.keys(stateDistrictsMap).sort();

// Generate a 12-month seasonal NDVI curve from the current live NDVI + seasonal multipliers
function buildSeasonalTrend(currentNdvi: number, lat: number) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // Tropical latitudes (< 23.5°) have monsoon peak Jun-Sep; temperate have spring peak
  const isTropical = Math.abs(lat) < 23.5;
  const monsoonMult = isTropical
    ? [0.48, 0.52, 0.64, 0.75, 0.82, 0.92, 1.0, 0.97, 0.88, 0.70, 0.56, 0.48]
    : [0.52, 0.60, 0.80, 0.95, 1.0, 0.93, 0.85, 0.80, 0.70, 0.60, 0.54, 0.50];
  const peak = Math.max(...monsoonMult);
  return months.map((month, i) => ({
    month,
    ndvi: parseFloat((currentNdvi * monsoonMult[i] / peak).toFixed(3))
  }));
}

function getStatusConfig(ndvi: number) {
  if (ndvi >= 0.75) return { status: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-400", pct: 95 };
  if (ndvi >= 0.60) return { status: "Good",      color: "text-green-500",   bg: "bg-green-500/10",   border: "border-green-500/20",   bar: "bg-green-500",   pct: 78 };
  if (ndvi >= 0.45) return { status: "Moderate",  color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20",  bar: "bg-yellow-400",  pct: 58 };
  if (ndvi >= 0.30) return { status: "Poor",      color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  bar: "bg-orange-400",  pct: 38 };
  return                   { status: "Critical",  color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     bar: "bg-red-400",     pct: 15 };
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NDVIAnalysis = () => {
  const { 
    selectedDistrict: globalDistrict, 
    setSelectedDistrict: setGlobalDistrict,
    mode,
    setMode
  } = useGlobalLocation();

  const [localState, setLocalState] = useState("Andhra Pradesh");
  const [refreshKey, setRefreshKey] = useState(0);

  const activeDistrict = globalDistrict || stateDistrictsMap[localState]?.[0] || "Visakhapatnam";

  const { data: envData, setDistrict } = useLiveWeather(activeDistrict);

  const handleStateChange = (newState: string) => {
    setLocalState(newState);
    const first = stateDistrictsMap[newState]?.[0] || "";
    setGlobalDistrict(first);
    setDistrict(first);
    setMode("district");
  };

  const handleDistrictChange = (d: string) => {
    setGlobalDistrict(d);
    setDistrict(d);
    setMode("district");
  };

  const refresh = () => setRefreshKey(k => k + 1);

  const isLoading = envData.status === "loading";
  const ndvi = envData.ndvi;
  const lat  = envData.lat;
  const cfg  = getStatusConfig(ndvi);

  const trendData = useMemo(() => buildSeasonalTrend(ndvi, lat), [ndvi, lat, refreshKey]);
  const peakNdvi   = Math.max(...trendData.map(d => d.ndvi));
  const avgNdvi    = parseFloat((trendData.reduce((s, d) => s + d.ndvi, 0) / 12).toFixed(3));
  const troughNdvi = Math.min(...trendData.map(d => d.ndvi));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-xl shadow-green-500/10 ring-1 ring-green-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-foreground tracking-tighter">NDVI Analysis</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Normalized Difference Vegetation Index</p>
          </div>
        </div>

        {/* District Selector */}
        <div className="flex items-center gap-3 p-1.5 rounded-3xl bg-muted/20 border border-border/5 backdrop-blur-md shadow-xl">
          <div className="flex flex-col px-3 border-r border-border/10">
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">State</span>
            <Select value={localState} onValueChange={handleStateChange}>
              <SelectTrigger className="bg-transparent border-none font-black text-sm h-auto p-0 hover:bg-transparent focus:ring-0 w-28">
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
          <div className="flex flex-col px-3">
            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">District</span>
            <Select value={activeDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="bg-transparent border-none font-black text-sm h-auto p-0 hover:bg-transparent focus:ring-0 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stateDistrictsMap[localState]?.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 px-2">
            <button onClick={refresh} className="w-10 h-10 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center hover:bg-muted/60 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Panel — Live NDVI */}
        <div className="lg:col-span-1 space-y-5">

          {/* Main NDVI card */}
          <div className={`p-8 rounded-4xl ${cfg.bg} border ${cfg.border} backdrop-blur-xl shadow-2xl relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-400/5 blur-3xl -mr-10 -mt-10 pointer-events-none" />

            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${cfg.bar} animate-pulse shadow-lg`} />
              <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                {mode === "current" ? "Live Location" : "District Intel"} · {activeDistrict}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <div className="flex flex-col items-center py-6">
                  <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-3" />
                  <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Syncing satellite...</span>
                </div>
              ) : (
                <motion.div key={activeDistrict + ndvi} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className="flex items-end gap-3 mb-2">
                    <span className="text-6xl font-black text-foreground tracking-tighter">{ndvi.toFixed(3)}</span>
                  </div>
                  <span className={`text-sm font-black uppercase tracking-widest ${cfg.color}`}>{cfg.status} Vegetation</span>

                  {/* Health bar */}
                  <div className="mt-5 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cfg.pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${cfg.bar}`}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground/40 font-black">0.0</span>
                    <span className="text-[9px] text-muted-foreground/40 font-black">1.0</span>
                  </div>

                  <p className="text-xs text-muted-foreground/70 font-medium leading-relaxed mt-4 border-t border-border/10 pt-4">
                    {cfg.status === "Excellent" && "Lush canopy density detected. Chlorophyll absorption at peak seasonal levels."}
                    {cfg.status === "Good" && "Vegetation biomass within optimal range. Crop growth proceeding well."}
                    {cfg.status === "Moderate" && "Partial stress detected. Consider checking irrigation and fertilization schedules."}
                    {cfg.status === "Poor" && "Significant vegetation stress. Crop health requires immediate intervention."}
                    {cfg.status === "Critical" && "Bare soil or severe distress detected. Immediate field inspection recommended."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stats cards */}
          <div className="space-y-3">
            {[
              { label: "Seasonal Peak",   value: isLoading ? "---" : peakNdvi.toFixed(3),   icon: TrendingUp,   color: "text-blue-400",   bg: "bg-blue-500/10" },
              { label: "Seasonal Avg",    value: isLoading ? "---" : avgNdvi.toFixed(3),     icon: Activity,     color: "text-green-400",  bg: "bg-green-500/10" },
              { label: "Seasonal Trough", value: isLoading ? "---" : troughNdvi.toFixed(3),  icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-500/10" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-card/20 border border-border/5 hover:bg-card/40 transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-lg font-black text-foreground tracking-tighter">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Coordinates badge */}
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-muted/10 border border-border/5">
            <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">GPS Coordinates</span>
              <span className="text-xs font-black text-foreground">{lat.toFixed(4)}°N, {envData.lon.toFixed(4)}°E</span>
            </div>
          </div>
        </div>

        {/* Right Panel — Chart + Insights */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Area Chart */}
          <div className="p-8 rounded-4xl bg-card/30 border border-border/10 backdrop-blur-2xl shadow-3xl shadow-green-500/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display font-black text-xl text-foreground tracking-tight">Seasonal Growth Trend</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Estimated NDVI curve for {activeDistrict} — 12-month projection</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Live Model</span>
              </div>
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="ndvi_grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)", fontWeight: 800 }} />
                  <YAxis domain={[0, 1]} axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)", fontWeight: 800 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(10,20,16,0.95)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "16px" }}
                    formatter={(v: any) => [v.toFixed(3), "NDVI"]}
                  />
                  <ReferenceLine y={0.6} stroke="rgba(34,197,94,0.3)" strokeDasharray="4 4" label={{ value: "Healthy ↑", fill: "rgba(34,197,94,0.5)", fontSize: 9, fontWeight: 800 }} />
                  <Area type="monotone" dataKey="ndvi" stroke="#22C55E" strokeWidth={4} fill="url(#ndvi_grad)"
                    dot={{ r: 4, fill: "#22C55E", strokeWidth: 0 }} activeDot={{ r: 6, fill: "#22C55E" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* NDVI Scale Legend */}
          <div className="grid sm:grid-cols-5 gap-3">
            {[
              { range: "≥ 0.75", label: "Excellent", color: "bg-emerald-500", text: "text-emerald-400" },
              { range: "0.60+",  label: "Good",       color: "bg-green-500",   text: "text-green-400" },
              { range: "0.45+",  label: "Moderate",   color: "bg-yellow-400",  text: "text-yellow-400" },
              { range: "0.30+",  label: "Poor",       color: "bg-orange-500",  text: "text-orange-400" },
              { range: "< 0.30", label: "Critical",   color: "bg-red-500",     text: "text-red-400" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-card/20 border border-border/5 flex flex-col items-center gap-2 hover:bg-card/40 transition-all">
                <div className={`w-4 h-4 rounded-full ${item.color} shadow-lg`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${item.text}`}>{item.label}</span>
                <span className="text-[9px] font-bold text-muted-foreground/50">{item.range}</span>
              </div>
            ))}
          </div>

          {/* Next Review */}
          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-black text-sm text-foreground">Next Sentinel-2 Overpass</h4>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Scheduled in 4 days · {activeDistrict} Sector</p>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-2xl bg-indigo-500/80 text-[10px] font-black text-white hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20">
              VIEW SCHEDULE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NDVIAnalysis;
