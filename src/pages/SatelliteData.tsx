import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, MapPin, Search, Loader2, Cloud, Zap, Layers } from "lucide-react";
import { useLiveWeather, DISTRICT_COORDS } from "@/hooks/useLiveWeather";

const stateDistrictsMap = Object.entries(DISTRICT_COORDS).reduce((acc, [dist, info]) => {
  if (!acc[info.state]) acc[info.state] = [];
  acc[info.state].push(dist);
  return acc;
}, {} as Record<string, string[]>);

const states = Object.keys(stateDistrictsMap).sort();

type ViewMode = "TRUE_COLOR" | "FALSE_COLOR" | "NDVI";

const viewModesInfo = {
  TRUE_COLOR: {
    label: "VISIBLE SPECTRUM",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?",
    filter: "saturate(1.2) contrast(1.1)",
    reflectance: "0.15",
    desc: "RGB bands detecting natural visual terrain."
  },
  FALSE_COLOR: {
    label: "NIR SPECTRUM",
    image: "https://images.unsplash.com/photo-1620921508215-68ffc71a3d90?",
    filter: "hue-rotate(280deg) saturate(2) contrast(1.2)",
    reflectance: "0.84",
    desc: "Highlights vegetation biomass using Near-Infrared sensors."
  },
  NDVI: {
    label: "NDVI HEATMAP",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?",
    filter: "sepia(1) hue-rotate(90deg) saturate(5) contrast(1.5)",
    reflectance: "0.68",
    desc: "Computed Normalized Difference Vegetation Index mapping crop health."
  }
};

const SatelliteData = () => {
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrictState] = useState(stateDistrictsMap["Maharashtra"][0]);
  const [viewMode, setViewMode] = useState<ViewMode>("TRUE_COLOR");
  const [isSyncing, setIsSyncing] = useState(false);

  // Hook into live weather for cloud cover & metadata!
  const { data: envData, setDistrict } = useLiveWeather(district);

  const handleStateChange = (newState: string) => {
    setState(newState);
    const firstDistrict = stateDistrictsMap[newState]?.[0] || "";
    setDistrictState(firstDistrict);
    setDistrict(firstDistrict);
    triggerSync();
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrictState(newDistrict);
    setDistrict(newDistrict);
    triggerSync();
  };

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1500);
  };

  const currentInfo = viewModesInfo[viewMode];
  const isLoading = envData.status === "loading" || isSyncing;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6">
      
      {/* Top Header & Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border/10 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/20">
                <Satellite className="w-6 h-6" />
             </div>
             <div>
                <h1 className="font-display text-2xl font-black text-foreground tracking-tighter">Satellite Intelligence</h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Multi-Spectral Analysis Array</p>
             </div>
          </div>

          <div className="flex items-center gap-3 p-1.5 rounded-3xl bg-muted/20 border border-border/5 backdrop-blur-md shadow-xl">
            <div className="flex flex-col px-3 border-r border-border/10">
               <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Region</span>
               <select 
                 value={state}
                 onChange={(e) => handleStateChange(e.target.value)}
                 className="bg-transparent border-none appearance-none font-black text-sm text-foreground cursor-pointer outline-none w-32 focus:ring-0"
               >
                 {states.map((s) => (<option key={s} value={s}>{s}</option>))}
               </select>
            </div>
            <div className="flex flex-col px-3">
               <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">District Point</span>
               <select 
                 value={district}
                 onChange={(e) => handleDistrictChange(e.target.value)}
                 className="bg-transparent border-none appearance-none font-black text-sm text-foreground cursor-pointer outline-none w-32 focus:ring-0"
               >
                 {stateDistrictsMap[state]?.map((d) => (<option key={d} value={d}>{d}</option>))}
               </select>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: Stats & Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-card/40 border border-border/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {isLoading && <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] z-10 flex items-center justify-center"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>}
            
            <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-5 px-1">Network Array Status</h3>
            <div className="space-y-3">
               {[
                 { label: "Constellation", value: "Sentinel-2A", status: "Active", color: "text-green-500" },
                 { label: "Telemetry", value: "Secure", status: "L2A Processed", color: "text-indigo-500" },
                 { label: "Target Lock", value: district, status: state, color: "text-orange-500" },
               ].map((item, i) => (
                 <div key={i} className="flex flex-col p-3 rounded-2xl bg-muted/20 border border-border/5">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{item.label}</span>
                     <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-background/50 ${item.color}`}>
                       {item.status}
                     </span>
                   </div>
                   <span className="text-sm font-bold text-foreground mt-1">{item.value}</span>
                 </div>
               ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-xl shadow-xl shadow-indigo-500/5">
             <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-display font-black text-sm text-foreground tracking-tight">Active Polygon</h4>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Bounds: {envData.lat.toFixed(2)}, {envData.lon.toFixed(2)}</p>
                </div>
             </div>
             <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
               Multi-spectral imagery is synchronized. Current visualization layer emphasizes <span className="text-indigo-500 font-bold">{currentInfo.desc}</span>
             </p>
          </div>
        </div>

        {/* Right: Map Preview / Data Feed */}
        <div className="lg:col-span-3 space-y-6">
           <div className="relative aspect-video rounded-4xl bg-muted/20 border border-border/10 overflow-hidden group shadow-2xl shadow-indigo-500/10 ring-4 ring-muted/10">
              
              <AnimatePresence mode="popLayout">
                <motion.div 
                  key={viewMode + district}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1, transition: { duration: 0.8 } }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${currentInfo.image}')`,
                    filter: currentInfo.filter,
                  }}
                />
              </AnimatePresence>
              
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
              
              {/* Overlay Controls */}
              <div className="absolute top-6 left-6 right-6 flex flex-wrap justify-between items-start gap-4">
                 <div className="flex gap-2 p-1.5 bg-background/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
                    <button 
                      onClick={() => setViewMode("TRUE_COLOR")}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "TRUE_COLOR" ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"}`}
                    >
                      True Color
                    </button>
                    <button 
                      onClick={() => setViewMode("FALSE_COLOR")}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "FALSE_COLOR" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "text-white/60 hover:text-white"}`}
                    >
                      False Color (NIR)
                    </button>
                    <button 
                      onClick={() => setViewMode("NDVI")}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === "NDVI" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "text-white/60 hover:text-white"}`}
                    >
                      NDVI Map
                    </button>
                 </div>
                 
                 <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white shadow-xl">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Live View</span>
                 </div>
              </div>

               {/* Center Loading Spinner */}
               <AnimatePresence>
                  {isLoading && (
                     <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-20"
                     >
                        <div className="flex flex-col items-center">
                           <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-2xl" />
                           <span className="mt-4 text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">Repositioning Optics...</span>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-10 pointer-events-none">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">{currentInfo.label}</span>
                    <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{district} Sector</h2>
                 </div>
                 <button onClick={triggerSync} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all shadow-xl pointer-events-auto group">
                    <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
           </div>

           <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-card border border-border/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                    <Zap className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Band Reflectance</h4>
                    <p className="text-2xl font-black text-foreground tracking-tighter">
                      {isLoading ? "---" : viewMode === "NDVI" ? envData.ndviLabel : currentInfo.reflectance}
                    </p>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <Cloud className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Cloud Cover</h4>
                    <p className="text-lg leading-tight font-black text-foreground tracking-tighter">
                      {isLoading ? "---" : envData.current.condition}
                    </p>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-card border border-border/10 shadow-xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <Layers className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Index Readout</h4>
                    <p className="text-xl leading-tight font-black text-foreground tracking-tighter">
                      {isLoading ? "---" : viewMode === "TRUE_COLOR" ? "Visual Base" : viewMode === "FALSE_COLOR" ? "B08-B04-B03" : `NDVI: ${envData.ndvi}`}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteData;
