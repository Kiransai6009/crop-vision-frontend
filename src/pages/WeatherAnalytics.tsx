import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudRain, Thermometer, Wind, CloudSun, Droplets, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { weatherService } from "@/services/api";

const weatherData = [
  { month: "Jan", rainfall: 12, temp: 18 }, { month: "Feb", rainfall: 15, temp: 21 },
  { month: "Mar", rainfall: 42, temp: 26 }, { month: "Apr", rainfall: 68, temp: 31 },
  { month: "May", rainfall: 95, temp: 34 }, { month: "Jun", rainfall: 180, temp: 33 },
  { month: "Jul", rainfall: 220, temp: 30 }, { month: "Aug", rainfall: 195, temp: 29 },
  { month: "Sep", rainfall: 140, temp: 28 }, { month: "Oct", rainfall: 60, temp: 27 },
  { month: "Nov", rainfall: 18, temp: 22 }, { month: "Dec", rainfall: 8, temp: 18 },
];

const WeatherAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
       try {
          const res = await weatherService.getForecast(18.5204, 73.8567);
          setData(res);
       } catch (err) {
          console.error("Failed to fetch weather", err);
       } finally {
          setLoading(false);
       }
    };
    fetchWeather();
  }, []);

  const current = data?.current || {
    temperature: 28.4,
    rainfall: 1.2,
    humidity: 64,
    description: "Partly Cloudy",
    source: "Mock Data"
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      {/* Dynamic Weather Banner */}
      <div className="relative h-48 rounded-4xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/20 overflow-hidden group shadow-3xl shadow-blue-500/10 mb-4">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592210633466-21f3d14e9267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] opacity-40 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/60 to-transparent" />
         
         <div className="relative h-full flex flex-col justify-center px-10">
            <div className="flex items-center gap-4 mb-3">
               <div className="w-14 h-14 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl">
                  {loading ? <Loader2 className="animate-spin text-white" /> : <CloudSun className="w-8 h-8 text-white" />}
               </div>
               <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">{current.description}</h1>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">{loading ? "Synchronizing Sensors..." : `Live Atmospheric Report via ${current.source}`}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Temperature</span>
                  <span className="text-2xl font-black text-white tracking-tighter">{current.temperature}°C</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Precipitation</span>
                  <span className="text-2xl font-black text-white tracking-tighter">{current.rainfall}mm</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Rel. Humidity</span>
                  <span className="text-2xl font-black text-white tracking-tighter">{current.humidity}%</span>
               </div>
            </div>
         </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         {/* Temperature Chart */}
         <div className="p-8 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/10">
                     <Thermometer className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-black text-xl text-foreground tracking-tight">Climatic Temperature</h3>
               </div>
            </div>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData}>
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#111827", 
                          border: "1px solid rgba(255,255,255,0.1)", 
                          borderRadius: "16px",
                          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" 
                        }} 
                     />
                     <Line type="monotone" dataKey="temp" stroke="#F97316" strokeWidth={4} dot={{ r: 4, fill: '#F97316' }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Rainfall Chart */}
         <div className="p-8 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                     <CloudRain className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-black text-xl text-foreground tracking-tight">Precipitation Log</h3>
               </div>
            </div>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weatherData}>
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#111827", 
                          border: "1px solid rgba(255,255,255,0.1)", 
                          borderRadius: "16px",
                          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)" 
                        }} 
                     />
                     <Bar dataKey="rainfall" fill="#3B82F6" radius={[8, 8, 0, 0]} opacity={0.6} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Humidity", value: `${current.humidity}%`, icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
           { label: "Wind Velocity", value: "14.2 km/h", icon: Wind, color: "text-green-500", bg: "bg-green-500/10" },
           { label: "Sensors Active", value: "Online", icon: CloudSun, color: "text-orange-500", bg: "bg-orange-500/10" },
         ].map((stat, i) => (
           <div key={i} className="p-6 rounded-3xl bg-card/20 border border-border/5 flex items-center gap-6 hover:bg-card/40 transition-all cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-current/10 shadow-2xl shadow-current/5`}>
                 <stat.icon className="w-7 h-7" />
              </div>
              <div>
                 <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">{stat.label}</h4>
                 <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default WeatherAnalytics;
