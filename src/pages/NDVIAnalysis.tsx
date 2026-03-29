import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Leaf, TrendingDown, Activity, 
  HelpCircle, ChevronRight, Share2, Loader2 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { satelliteService } from "@/services/api";

const ndviData = [
  { month: "Jan", ndvi: 0.21 }, { month: "Feb", ndvi: 0.28 }, { month: "Mar", ndvi: 0.45 },
  { month: "Apr", ndvi: 0.62 }, { month: "May", ndvi: 0.78 }, { month: "Jun", ndvi: 0.85 },
  { month: "Jul", ndvi: 0.82 }, { month: "Aug", ndvi: 0.73 }, { month: "Sep", ndvi: 0.58 },
  { month: "Oct", ndvi: 0.39 }, { month: "Nov", ndvi: 0.27 }, { month: "Dec", ndvi: 0.22 },
];

const NDVIAnalysis = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNDVI = async () => {
       try {
          const res = await satelliteService.getNDVI(18.5204, 73.8567, "2024-01-01", "2024-12-31");
          setData(res);
       } catch (err) {
          console.error("Failed to fetch NDVI", err);
       } finally {
          setLoading(false);
       }
    };
    fetchNDVI();
  }, []);

  const currentNDVI = data?.ndvi || 0.78;
  const status = currentNDVI > 0.6 ? "Healthy" : currentNDVI >= 0.3 ? "Moderate" : "Poor";

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/10 pb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl font-black text-foreground flex items-center gap-3 tracking-tighter">
            <Leaf className="w-10 h-10 text-green-500" />
            <span>NDVI Analysis</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl mt-2">
            Normalized Difference Vegetation Index analysis. Monitoring crop health status through multi-spectral satellite imagery.
          </p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/40 hover:bg-muted/60 text-xs font-bold border border-border/10 transition-all">
              <Share2 className="w-3.5 h-3.5" />
              <span>EXPORT</span>
           </button>
           <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-xs font-black text-white shadow-xl shadow-green-500/20 transition-all">
              <span>{loading ? "SYNCING..." : "REFRESH DATA"}</span>
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Statistics & Insights */}
        <div className="lg:col-span-1 space-y-6">
           <div className="p-8 rounded-3xl bg-card/40 border border-border/10 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 blur-3xl -mr-10 -mt-10" />
              <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-6">Current Health</h3>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-2xl shadow-green-500/5 border border-green-500/10 scale-110">
                    {loading ? <Loader2 className="animate-spin" /> : <Activity className="w-8 h-8" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-3xl font-black text-foreground tracking-tighter">{currentNDVI.toFixed(3)}</span>
                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Optimal Range</span>
                 </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 mb-2">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Status</span>
                    <span className="text-[10px] font-black text-green-500 px-2 py-0.5 rounded-lg bg-green-500/10 uppercase">{status}</span>
                 </div>
                 <p className="text-xs text-muted-foreground/80 font-medium leading-relaxed">
                   Crop biomass and chlorophyll levels are within {currentNDVI > 0.6 ? "top 5%" : "standard ranges"} of historical seasonal averages.
                 </p>
              </div>
           </div>

           <div className="space-y-3">
              {[
                { label: "Historical Peak", value: data?.peak || "0.89", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Seasonal Avg", value: data?.average || "0.62", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
                { label: "Lowest Record", value: data?.trough || "0.21", icon: TrendingDown, color: "text-orange-500", bg: "bg-orange-500/10" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-card/20 border border-border/5 hover:bg-card/40 transition-all cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest">{item.label}</span>
                   </div>
                   <span className="text-lg font-black text-foreground tracking-tighter">{item.value}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Chart Analysis */}
        <div className="lg:col-span-2 space-y-6">
           <div className="p-8 rounded-4xl bg-card/30 border border-border/10 backdrop-blur-2xl shadow-3xl shadow-green-500/5 min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="font-display font-black text-xl text-foreground tracking-tight">Growth Trend</h3>
                    <p className="text-xs text-muted-foreground font-medium">NDVI temporal variance over 12 months</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full bg-green-500 shadow-xl shadow-green-500/40" />
                       <span className="text-[9px] font-bold text-muted-foreground/80 uppercase">Vegetation Index (NDVI)</span>
                    </div>
                 </div>
              </div>

              <div className="w-full h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data?.trend || ndviData}>
                       <defs>
                          <linearGradient id="ndvi_grad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                             <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 800 }} 
                       />
                       <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)", fontWeight: 800 }} 
                       />
                       <Tooltip 
                          contentStyle={{ 
                            backgroundColor: "rgba(10,20,16,0.9)", 
                            backdropFilter: "blur(12px)",
                            border: "1px solid rgba(34,197,94,0.2)",
                            borderRadius: "16px",
                            boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)"
                          }} 
                       />
                       <Area 
                          type="monotone" 
                          dataKey="ndvi" 
                          stroke="#22C55E" 
                          strokeWidth={4} 
                          fill="url(#ndvi_grad)" 
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                    <Activity className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="font-display font-black text-sm text-foreground">Next Review Cycle</h4>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Scheduled in 4 days (Sentinel-2 overpass)</p>
                 </div>
              </div>
              <button className="px-5 py-2 rounded-2xl bg-blue-500/80 text-[10px] font-black text-white hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10">
                 VIEW SCHEDULE  
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default NDVIAnalysis;
