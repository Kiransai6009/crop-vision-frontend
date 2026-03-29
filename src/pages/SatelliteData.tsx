import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Satellite, Layers, MapPin, Search } from "lucide-react";
import { satelliteService } from "@/services/api";

const SatelliteData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawData = await satelliteService.getRawData();
        setData(rawData);
      } catch (err) {
        console.error("Failed to fetch satellite data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 border-b border-border/10 pb-6">
          <h1 className="font-display text-3xl font-black text-foreground flex items-center gap-3 tracking-tighter">
            <Satellite className="w-8 h-8 text-green-500" />
            <span>Satellite Intelligence</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">
            Raw spectral data from Sentinel-2 and Landsat-9 satellites. Monitoring soil reflectance and vegetation patterns.
          </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Stats & Status */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-card/40 border border-border/10 backdrop-blur-xl shadow-2xl"
          >
            <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-6 px-1">Sensor Status</h3>
            <div className="space-y-4">
               {[
                 { label: "Active Satellites", value: "3", status: "Optimal", color: "text-green-500" },
                 { label: "Last Sync", value: "14m ago", status: "Real-time", color: "text-blue-500" },
                 { label: "Resolution", value: "10m/px", status: "L2A Processed", color: "text-orange-500" },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/5">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-muted-foreground/40">{item.label}</span>
                     <span className="text-sm font-bold text-foreground">{item.value}</span>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg bg-background/50 ${item.color}`}>
                     {item.status}
                   </span>
                 </div>
               ))}
            </div>
          </motion.div>

          <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 backdrop-blur-xl">
             <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 shadow-xl shadow-green-500/10 ring-1 ring-green-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-display font-black text-sm text-foreground tracking-tight">Active ROI</h4>
                   <p className="text-[10px] text-muted-foreground font-medium">Monitoring Polygon #8291</p>
                </div>
             </div>
             <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
               Multi-spectral imagery is being captured every 5 days for this region. Soil moisture index is currently showing high variance.
             </p>
          </div>
        </div>

        {/* Right: Map Preview / Data Feed */}
        <div className="lg:col-span-2 space-y-6">
           <div className="relative aspect-video rounded-3xl bg-muted/20 border border-border/10 overflow-hidden group shadow-2xl shadow-green-500/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              
              {/* Overlay Controls */}
              <div className="absolute top-4 left-4 flex gap-2">
                 <button className="px-3 py-1.5 rounded-xl bg-background/80 backdrop-blur-md text-[10px] font-black text-foreground border border-border/20 shadow-xl">
                   VIEW: TRUE COLOR
                 </button>
                 <button className="px-3 py-1.5 rounded-xl bg-green-500/80 backdrop-blur-md text-[10px] font-black text-white border border-green-500 shadow-xl">
                   VIEW: FALSE COLOR
                 </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Preview</span>
                    <h2 className="text-xl font-black text-white tracking-tighter">Satellite Feed: MH-42</h2>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-md flex items-center justify-center text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white transition-all">
                    <Search className="w-4 h-4" />
                 </button>
              </div>
           </div>

           <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-card/30 border border-border/10 hover:bg-card/50 transition-all">
                 <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">Reflectance Data</h4>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground tracking-tighter">0.84</span>
                    <span className="text-[10px] font-black text-green-500 uppercase">Top of atmosphere</span>
                 </div>
              </div>
              <div className="p-5 rounded-3xl bg-card/30 border border-border/10 hover:bg-card/50 transition-all">
                 <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">Cloud Cover</h4>
                 <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground tracking-tighter">1.2%</span>
                    <span className="text-[10px] font-black text-blue-500 uppercase">Clear skies</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteData;
