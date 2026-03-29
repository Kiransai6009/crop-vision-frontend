import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Filter, Download, ArrowUpRight, TrendingUp, Search, Loader2 } from "lucide-react";
import { yieldService } from "@/services/api";
import { toast } from "sonner";

const mockHistory = [
  { id: 1, date: "2024-03-20", crop: "Rice", region: "Ahmednagar, MH", yield: "4.72 t/ha", accuracy: "94.2%", status: "Harvested" },
  { id: 2, date: "2024-03-15", crop: "Wheat", region: "Ludhiana, PJ", yield: "5.10 t/ha", accuracy: "92.8%", status: "In Progress" },
  { id: 3, date: "2024-02-28", crop: "Maize", region: "Pune, MH", yield: "3.85 t/ha", accuracy: "95.1%", status: "Harvested" },
  { id: 4, date: "2024-02-12", crop: "Soybean", region: "Bangalore, KA", yield: "2.40 t/ha", accuracy: "91.5%", status: "Planned" },
  { id: 5, date: "2024-01-25", crop: "Sugarcane", region: "Aurangabad, MH", yield: "78.4 t/ha", accuracy: "93.9%", status: "Harvested" },
];

const PredictionHistory = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await yieldService.getHistory();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      // Fallback to empty if failed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    (item.crop?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.id?.toString().includes(searchTerm))
  );

  const exportToCSV = () => {
    if (history.length === 0) {
      toast.error("No data available to export.");
      return;
    }
    const headers = ["ID", "Crop", "NDVI", "Yield (t/ha)", "Timestamp"];
    const rows = history.map(log => [
      log.id,
      log.crop,
      log.ndvi_value?.toFixed(4),
      log.predicted_yield?.toFixed(2),
      log.created_at
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `prediction_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Prediction logs exported successfully.");
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border/10 pb-8 gap-4">
        <div>
          <h1 className="font-display text-4xl font-black text-foreground flex items-center gap-4 tracking-tighter">
            <ClipboardList className="w-10 h-10 text-green-500" />
            <span>Prediction History</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl mt-2">
            Historical database of ML-generated yield forecasts. Managing and analyzing multi-seasonal agricultural performance records.
          </p>
        </div>
        <div className="flex gap-2">
           <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted/40 hover:bg-muted/60 text-xs font-black border border-border/10 transition-all"
            >
              <Download className="w-4 h-4 text-green-500" />
              <span>EXPORT DATA (CSV)</span>
           </button>
           <button 
              onClick={fetchHistory}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-xs font-black text-white shadow-xl shadow-green-500/20 transition-all group"
           >
              <span>{loading ? "SYNCING..." : "SYNC NEW DATA"}</span>
              <TrendingUp className={`w-4 h-4 group-hover:scale-110 transition-transform ${loading ? "animate-spin" : ""}`} />
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Search & Filters */}
        <div className="lg:col-span-1 space-y-6">
           <div className="p-8 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-2xl shadow-2xl space-y-8">
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest px-1">Quick Search</h3>
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-green-500 transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search ID/Crop..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted/20 border border-border/5 text-xs font-bold text-foreground focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 mt-6 shadow-xl shadow-green-500/5">
                 <div className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1 px-1">Active Storage</div>
                 <div className="text-2xl font-black text-foreground tracking-tighter">1.2 GB</div>
                 <p className="text-[9px] text-muted-foreground font-black uppercase mt-1">SUPERBASE SYNCED</p>
              </div>
           </div>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-3">
           <div className="rounded-4xl bg-card/30 border border-border/10 backdrop-blur-xl shadow-3xl overflow-hidden min-h-[500px]">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-border/10">
                          <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Prediction Log</th>
                          <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop Type</th>
                          <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">NDVI Value</th>
                          <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Resulting Yield</th>
                          <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/5">
                       {filteredHistory.length === 0 && !loading ? (
                         <tr><td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">No prediction logs found. Run a prediction to see it here.</td></tr>
                       ) : (
                         filteredHistory.map((log, idx) => (
                           <tr key={log.id || idx} className="group hover:bg-muted/20 transition-all cursor-pointer">
                              <td className="px-8 py-6">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground">SES-{(idx + 1) * 1024}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">ID: {log.id?.slice(0,8)}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1.5 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider border border-green-500/10">
                                    {log.crop || "Unknown"}
                                 </span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-foreground">{log.ndvi_value?.toFixed(3) || "0.000"}</span>
                                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-foreground">{log.predicted_yield?.toFixed(2) || "0.00"} t/ha</span>
                                    <span className="text-[10px] font-black text-blue-500 uppercase">94.8% Conf.</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    {log.created_at ? new Date(log.created_at).toLocaleDateString() : 'N/A'}
                                 </span>
                              </td>
                           </tr>
                         ))
                       )}
                       {loading && (
                         <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-green-500" /></td></tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionHistory;
