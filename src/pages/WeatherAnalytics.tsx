import { useState } from "react";
import { motion } from "framer-motion";
import { CloudRain, Thermometer, Wind, CloudSun, Droplets, MapPin, Loader2, Calendar } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLiveWeather, DISTRICT_COORDS } from "@/hooks/useLiveWeather";
import { useGlobalLocation } from "@/context/LocationContext";

const stateDistrictsMap = Object.entries(DISTRICT_COORDS).reduce((acc, [dist, info]) => {
  if (!acc[info.state]) acc[info.state] = [];
  acc[info.state].push(dist);
  return acc;
}, {} as Record<string, string[]>);

const states = Object.keys(stateDistrictsMap).sort();

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WeatherAnalytics = () => {
  const { 
    selectedDistrict: globalDistrict, 
    setSelectedDistrict: setGlobalDistrict,
    mode,
    city,
    lat: userLat,
    lon: userLon,
    setMode
  } = useGlobalLocation();

  const [state, setState] = useState("Maharashtra");
  const [district, setDistrictState] = useState(stateDistrictsMap["Maharashtra"][0]);
  
  const activeDistrict = mode === "current" ? city : (globalDistrict || district);

  // Real-time weather hook
  const { data: envData, setDistrict } = useLiveWeather(
    activeDistrict,
    mode === "current" && userLat && userLon ? { lat: userLat, lon: userLon, state: "" } : undefined
  );

  const handleStateChange = (newState: string) => {
    setState(newState);
    const firstDistrict = stateDistrictsMap[newState]?.[0] || "";
    setDistrictState(firstDistrict);
    setDistrict(firstDistrict);
  };

  const handleDistrictChange = (newDistrict: string) => {
    setDistrictState(newDistrict);
    setDistrict(newDistrict);
  };

  const current = envData.current;
  const isLoading = envData.status === "loading";

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto py-6">
      {/* Top Global Selector */}
      <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b border-border/10">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-xl shadow-blue-500/10">
               <CloudSun className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-2xl font-black text-foreground tracking-tighter leading-none mb-1">Climatic Telemetry</h1>
               <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                 Synching via Open-Meteo Satellite {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
               </p>
            </div>
         </div>

         <div className="flex items-center gap-3 p-1.5 rounded-3xl bg-muted/20 border border-border/5 backdrop-blur-md shadow-xl">
            <div className="flex flex-col px-3 border-r border-border/10">
               <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Region</span>
               <Select value={state} onValueChange={handleStateChange}>
                 <SelectTrigger className="bg-transparent border-none font-black text-xs h-auto p-0 hover:bg-transparent focus:ring-0 w-28">
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
               <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">District Focus</span>
               <Select value={district} onValueChange={handleDistrictChange}>
                 <SelectTrigger className="bg-transparent border-none font-black text-xs h-auto p-0 hover:bg-transparent focus:ring-0 w-28">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {stateDistrictsMap[state]?.map((d) => (
                     <SelectItem key={d} value={d}>
                       {d}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>

            <button className="h-10 w-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
               <MapPin className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Dynamic Weather Banner */}
      <div className="relative h-56 rounded-4xl bg-gradient-to-br from-blue-600 to-blue-900 border border-blue-400/20 overflow-hidden group shadow-3xl shadow-blue-500/10">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592210633466-21f3d14e9267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] opacity-50 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" />
         <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/60 to-transparent" />
         
         <div className="relative h-full flex flex-col justify-center px-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 shadow-2xl">
                  {isLoading ? <Loader2 className="animate-spin text-white w-8 h-8" /> : <CloudSun className="w-8 h-8 text-white relative z-10" />}
               </div>
               <div>
                  <h1 className="text-4xl font-black text-white tracking-tighter">{isLoading ? "---" : current.condition}</h1>
                  <p className="text-[11px] text-white/70 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> {mode === "current" ? city : `${district}, ${state}`}
                  </p>
               </div>
            </div>
            
            <div className="flex items-center gap-10 mt-2">
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Temperature</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{isLoading ? "..." : `${current.temp}°C`}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Precipitation (24h)</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{isLoading ? "..." : `${current.rainfall}mm`}</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/50 uppercase mb-1">Rel. Humidity</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{isLoading ? "..." : `${current.humidity}%`}</span>
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
                  <h3 className="font-display font-black text-xl text-foreground tracking-tight">7-Day Thermal Forecast</h3>
               </div>
            </div>
            <div className="h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={envData.forecast}>
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }} 
                     />
                     <Line type="monotone" name="Max Temp" dataKey="tempMax" stroke="#F97316" strokeWidth={4} dot={{ r: 4, fill: '#F97316' }} />
                     <Line type="monotone" name="Min Temp" dataKey="tempMin" stroke="#8B5CF6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 3, fill: '#8B5CF6' }} />
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
                  <BarChart data={envData.forecast}>
                     <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontWeight: 800}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px" }} 
                     />
                     <Bar dataKey="rain" name="Rainfall (mm)" fill="#3B82F6" radius={[8, 8, 0, 0]} opacity={0.6} />
                     <Line type="monotone" name="Humidity (%)" dataKey="humidity" stroke="#10B981" strokeWidth={3} yAxisId="1" dot={false} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Humidity", value: `${current.humidity}%`, icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
           { label: "Wind Velocity", value: `${current.wind} km/h`, icon: Wind, color: "text-indigo-500", bg: "bg-indigo-500/10" },
           { label: "Feels Like", value: `${current.feelsLike}°C`, icon: Thermometer, color: "text-rose-500", bg: "bg-rose-500/10" },
           { label: "UV Index", value: current.uvIndex.toString(), icon: CloudSun, color: "text-orange-500", bg: "bg-orange-500/10" },
         ].map((stat, i) => (
           <div key={i} className="p-6 rounded-3xl bg-card/20 border border-border/5 flex items-center justify-between hover:bg-card/40 transition-all cursor-pointer">
              <div className="flex flex-col">
                 <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">{stat.label}</h4>
                 <p className="text-2xl font-black text-foreground tracking-tighter">{isLoading ? "..." : stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-current/10 shadow-xl shadow-current/5`}>
                 <stat.icon className="w-5 h-5" />
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default WeatherAnalytics;
