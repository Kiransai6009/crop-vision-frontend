import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Satellite, CloudRain, Thermometer, Droplets, TrendingUp,
  Wheat, MapPin, Leaf, BarChart3, Loader2
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { yieldService } from "@/services/api";

const crops = [
  "Rice", "Wheat", "Maize", "Soybean", "Cotton", "Sugarcane", "Jowar", "Groundnut", "Sunflower"
];

const stateDistricts: Record<string, string[]> = {
  "Maharashtra": ["Pune", "Nagpur", "Nashik", "Aurangabad", "Amravati"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubli", "Belagavi", "Dharwad"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
};

const states = Object.keys(stateDistricts);

const StatCard = ({
  icon: Icon, label, value, sub, color, delay
}: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/10 shadow-2xl transition-all hover:bg-card/60 group cursor-default"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase group-hover:text-primary/60 transition-colors">{sub}</span>
    </div>
    <div className="font-display font-black text-3xl text-foreground tracking-tighter">{value}</div>
    <div className="text-[11px] text-muted-foreground mt-1 font-black uppercase tracking-widest">{label}</div>
  </motion.div>
);

const Dashboard = () => {
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [selectedState, setSelectedState] = useState("Maharashtra");
  const [selectedDistrict, setSelectedDistrict] = useState(stateDistricts["Maharashtra"][0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const districts = stateDistricts[selectedState] || [];

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict(stateDistricts[state]?.[0] || "");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Find Lat/Lon from a mock or real source. For now using sample coords.
        const res = await yieldService.getDashboard(18.5204, 73.8567, selectedCrop);
        setData(res);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedDistrict, selectedCrop]);

  return (
    <div className="flex flex-col gap-8 relative z-20 max-w-[1500px] mx-auto pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-border/10 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-green-500/10 text-[10px] font-black text-green-500 uppercase tracking-widest border border-green-500/10">ANALYZING SESSION #8291</div>
             {loading && <Loader2 className="w-4 h-4 text-green-500 animate-spin" />}
          </div>
          <h1 className="font-display text-4xl font-black text-foreground flex items-center gap-4 tracking-tighter">
            <TrendingUp className="w-10 h-10 text-green-500" />
            <span>{selectedCrop} Analytics Hub</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">
            High-precision monitoring for <span className="text-green-500 font-bold">{selectedDistrict}, {selectedState}</span>. 
            Synthesizing multi-source satellite reflectance and historical weather patterns.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-4 p-2 rounded-3xl bg-muted/20 border border-border/5 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col px-3 gap-0.5 border-r border-border/10">
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">Commodity</span>
             <select
               value={selectedCrop}
               onChange={(e) => setSelectedCrop(e.target.value)}
               className="bg-transparent border-none appearance-none font-black text-xs text-foreground cursor-pointer outline-none"
             >
               {crops.map((c) => (<option key={c} value={c}>{c}</option>))}
             </select>
          </div>
          <div className="flex flex-col px-3 gap-0.5 border-r border-border/10">
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">Region</span>
             <select
               value={selectedState}
               onChange={(e) => handleStateChange(e.target.value)}
               className="bg-transparent border-none appearance-none font-black text-xs text-foreground cursor-pointer outline-none"
             >
               {states.map((s) => (<option key={s} value={s}>{s}</option>))}
             </select>
          </div>
          <div className="flex flex-col px-3 gap-0.5">
             <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">District</span>
             <select
               value={selectedDistrict}
               onChange={(e) => setSelectedDistrict(e.target.value)}
               className="bg-transparent border-none appearance-none font-black text-xs text-foreground cursor-pointer outline-none"
             >
               {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
             </select>
          </div>
          <button className="h-12 w-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-xl shadow-green-500/20 hover:scale-105 transition-transform ml-2">
             <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Wheat} label="Yield Projection" value={data?.yield?.predicted ? `${data.yield.predicted} t/ha` : "..."} sub="PREDICTIVE" color="bg-green-500/10 text-green-500" delay={0.1} />
        <StatCard icon={Leaf} label="Vegetation (NDVI)" value={data?.ndvi?.current || "..."} sub="SATELLITE" color="bg-blue-500/10 text-blue-500" delay={0.2} />
        <StatCard icon={Thermometer} label="Ambient Temp" value={data?.weather?.temperature ? `${data.weather.temperature}°C` : "..."} sub="CLIMATIC" color="bg-orange-500/10 text-orange-500" delay={0.3} />
        <StatCard icon={Droplets} label="Soil Moisture" value={data?.ndvi?.soil_moisture ? `${(data.ndvi.soil_moisture * 100).toFixed(0)}%` : "..."} sub="PREVIEW" color="bg-indigo-500/10 text-indigo-500" delay={0.4} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="p-10 rounded-4xl bg-card/30 backdrop-blur-3xl border border-border/10 shadow-3xl">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="font-display font-black text-xl text-foreground tracking-tight leading-none mb-1">Growth Index</h3>
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Spectral reflectance variance</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10">
                <Leaf className="w-6 h-6" />
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.ndvi?.trend || []}>
                <defs>
                   <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontWeight: 800 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontWeight: 800 }} axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ 
                     backgroundColor: "rgba(10,20,16,0.95)", 
                     border: "1px solid rgba(34,197,94,0.1)", 
                     borderRadius: "20px",
                     boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
                   }} 
                />
                <Area type="monotone" dataKey="ndvi" stroke="#22C55E" strokeWidth={5} fill="url(#ndviGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-10 rounded-4xl bg-card/30 backdrop-blur-3xl border border-border/10 shadow-3xl">
          <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="font-display font-black text-xl text-foreground tracking-tight leading-none mb-1">Harvest Forecast</h3>
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Predicted vs Historical Yield</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                <BarChart3 className="w-6 h-6" />
             </div>
          </div>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.yield?.history || []}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                   <XAxis dataKey="year" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontWeight: 800 }} axisLine={false} tickLine={false} />
                   <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontWeight: 800 }} axisLine={false} tickLine={false} />
                   <Tooltip />
                   <Line type="monotone" dataKey="actual" stroke="#22C55E" strokeWidth={5} dot={{ r: 6, fill: '#22C55E' }} strokeLinecap="round" />
                   <Line type="monotone" dataKey="predicted" stroke="#F97316" strokeWidth={3} strokeDasharray="8 8" dot={{ r: 4, fill: '#F97316' }} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid md:grid-cols-3 gap-6">
         {[
           { l: "Engine Status", v: "ML_V4 Active", s: "Live backend 5000", status: "Healthy" },
           { l: "Soil Health Index", v: data?.health?.status || "Analyzing", s: "Based on NDVI reflectance", status: "Live Feed" },
           { l: "Weather Reliability", v: data?.weather?.source || "Stable", s: "Synced with Meteor Node", status: "Verified" },
         ].map((Stat, i) => (
           <div key={i} className="p-8 rounded-4xl bg-card/20 border border-border/5 hover:bg-card/40 transition-all">
              <div className="flex items-center justify-between mb-2">
                 <h5 className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{Stat.l}</h5>
                 <span className="text-[9px] font-black text-green-500 px-2 py-0.5 rounded-lg bg-green-500/5">{Stat.status}</span>
              </div>
              <p className="text-2xl font-black text-foreground tracking-tighter">{Stat.v}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase tracking-tight">{Stat.s}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

export default Dashboard;
