import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, Bell, ShieldCheck, User, Moon, 
  Sun, Monitor, Globe, ChevronRight 
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { user, profile, refreshProfile } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [region, setRegion] = useState("Maharashtra, India");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      await authService.updateProfile({ display_name: displayName });
      await refreshProfile();
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6 pb-20">
      <div className="flex flex-col gap-2 border-b border-border/10 pb-10">
          <h1 className="font-display text-4xl font-black text-foreground flex items-center gap-4 tracking-tighter">
            <SettingsIcon className="w-10 h-10 text-green-500" />
            <span>Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">
            Customize your Crop Insight experience. Manage visualization preferences, notification protocols, and security configurations.
          </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-10">
         {/* Navigation */}
         <div className="lg:col-span-1 space-y-4">
            <div className="p-8 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-2xl shadow-xl space-y-4">
               {[
                 { label: "General", icon: SettingsIcon },
                 { label: "Profile", icon: User },
                 { label: "Appearance", icon: Moon },
                 { label: "Notifications", icon: Bell },
                 { label: "Security", icon: ShieldCheck },
               ].map((item, i) => (
                 <button key={i} className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${
                   i === 0 ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' : 'text-muted-foreground hover:bg-muted/30'
                 }`}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                 </button>
               ))}
            </div>
         </div>

         {/* Settings Content */}
         <div className="lg:col-span-3 space-y-12">
            {/* Profile Section */}
            <div className="p-10 rounded-4xl bg-card/30 border border-border/10 backdrop-blur-2xl shadow-3xl space-y-8">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground tracking-tighter">Personal Profile</h3>
                  <p className="text-xs text-muted-foreground font-medium">How you appear across the hub</p>
               </div>
               
               <div className="grid gap-6 max-w-md">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Display Name</label>
                     <Input 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="bg-white/5 border-white/10 rounded-xl h-12"
                        placeholder="Farmer Name"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Login Email</label>
                     <Input 
                        value={user?.email || ""} 
                        disabled 
                        className="bg-white/5 border-white/10 rounded-xl h-12 opacity-50 cursor-not-allowed"
                     />
                  </div>
                  <Button 
                     onClick={handleUpdateProfile} 
                     disabled={updating}
                     className="bg-green-500 text-white font-black rounded-xl h-12 hover:bg-green-600 transition-all shadow-xl shadow-green-500/20"
                  >
                     {updating ? "SYNCING..." : "UPDATE PROFILE"}
                  </Button>
               </div>
            </div>

            {/* Theme Section */}
            <div className="space-y-6">
               <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest px-2">Visualization Theme</h3>
               <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    { id: 'light' as const, label: 'LUMINA LIGHT', icon: Sun, bg: 'bg-white', text: 'text-zinc-900', border: 'border-zinc-200' },
                    { id: 'dark' as const, label: 'ONYX DARK', icon: Moon, bg: 'bg-zinc-950', text: 'text-white', border: 'border-white/10' },
                    { id: 'system' as const, label: 'ADAPTIVE OS', icon: Monitor, bg: 'bg-gradient-to-br from-zinc-900 to-white', text: 'text-zinc-900', border: 'border-zinc-200' },
                  ].map((t) => (
                    <button 
                       key={t.id}
                       onClick={() => t.id !== 'system' && setTheme(t.id)}
                       className={`flex flex-col items-center gap-4 p-8 rounded-4xl border-2 transition-all group relative overflow-hidden ${
                         theme === t.id ? 'border-green-500 bg-green-500/5 ring-8 ring-green-500/5' : 'border-border/10 bg-card/40'
                       }`}
                    >
                       <div className={`w-14 h-14 rounded-3xl ${t.bg} flex items-center justify-center ${t.text} ${t.border} border shadow-2xl transition-transform group-hover:scale-110`}>
                          <t.icon className="w-7 h-7" />
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                       {theme === t.id && (
                         <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-green-500 shadow-xl shadow-green-500 px-1" />
                       )}
                    </button>
                  ))}
               </div>
            </div>

            {/* Notifications */}
            <div className="p-10 rounded-4xl bg-card/30 border border-border/10 backdrop-blur-2xl shadow-3xl space-y-10">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-foreground tracking-tighter">Notification Alerts</h3>
                     <p className="text-xs text-muted-foreground font-medium">Critical satellite updates and harvest alerts</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-14 h-8 rounded-full transition-all relative p-1.5 ${notifications ? 'bg-green-500' : 'bg-muted/40'}`}
                  >
                     <div className={`w-5 h-5 rounded-full bg-white shadow-xl transition-all ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>

               <div className="grid sm:grid-cols-2 gap-8 pt-6 border-t border-border/10">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Active Region</h4>
                     <div className="h-14 px-5 rounded-3xl bg-muted/20 border border-border/10 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-all">
                        <div className="flex items-center gap-3">
                           <Globe className="w-5 h-5 text-blue-500" />
                           <span className="text-sm font-bold text-foreground">{region}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Preferred Units</h4>
                     <div className="h-14 px-5 rounded-3xl bg-muted/20 border border-border/10 flex items-center justify-between group cursor-pointer hover:bg-muted/40 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-5 h-5 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center text-[10px] font-black">MT</div>
                           <span className="text-sm font-bold text-foreground">METRIC TONS / HA</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-1 transition-transform" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Danger Zone */}
            <div className="p-8 rounded-4xl bg-red-500/5 border border-red-500/10 space-y-6">
               <h3 className="text-xs font-black text-red-500 uppercase tracking-widest px-2">Danger Registry</h3>
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                     <h4 className="text-sm font-black text-foreground">Purge Account Data</h4>
                     <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Permanently remove all prediction telemetry</p>
                  </div>
                  <button className="px-6 py-3 rounded-2xl bg-red-500 text-white font-black text-[10px] tracking-widest uppercase hover:bg-red-600 transition-all shadow-xl shadow-red-500/20">PURGE CACHE</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Settings;
