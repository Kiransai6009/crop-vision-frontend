import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, ShieldCheck, MapPin, Edit3, Settings, LogOut, CheckCircle2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

const UserProfile = () => {
  const { user, signOut } = useUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.email?.split('@')[0] || "Farmer");

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between border-b border-border/10 pb-8">
          <div className="flex items-center gap-6">
            <div className="relative group">
               <div className="w-24 h-24 rounded-4xl bg-green-500/20 flex items-center justify-center text-green-500 shadow-3xl shadow-green-500/10 border-4 border-background ring-2 ring-green-500/10 overflow-hidden">
                  <User className="w-12 h-12" />
               </div>
               <button className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-white dark:bg-zinc-800 text-foreground border border-border shadow-xl hover:scale-110 transition-transform">
                  <Edit3 className="w-4 h-4" />
               </button>
            </div>
            <div>
               <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none mb-2">{name}</h1>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-[10px] font-black text-green-500 uppercase tracking-widest border border-green-500/10">
                    <ShieldCheck className="w-3 h-3" />
                    <span>VERIFIED FARMER</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                     <MapPin className="w-3 h-3" /> Maharashtra, India
                  </span>
               </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setEditing(!editing)}
                className="px-5 py-2.5 rounded-2xl bg-muted/40 hover:bg-muted/60 text-xs font-black border border-border/10 transition-all flex items-center gap-2"
             >
                {editing ? "CANCEL" : "EDIT PROFILE"}
             </button>
             <button
               onClick={() => signOut()}
               className="px-5 py-2.5 rounded-2xl bg-red-500 text-white text-xs font-black shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center gap-2"
             >
               <LogOut className="w-4 h-4" />
               <span>SIGNOUT</span>
             </button>
          </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-8">
           <div className="p-8 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-2xl shadow-2xl space-y-8">
              <h3 className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest px-1">Account Credentials</h3>
              
              <div className="grid sm:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest px-1">Display Name</label>
                    <div className="h-14 px-5 rounded-3xl bg-muted/20 border border-border/10 flex items-center text-sm font-bold text-foreground">
                        {editing ? (
                          <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-transparent border-none outline-none w-full"
                          />
                        ) : name}
                    </div>
                 </div>
                 <div className="space-y-2 opacity-60">
                    <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest px-1">Primary Email</label>
                    <div className="h-14 px-5 rounded-3xl bg-muted/20 border border-border/10 flex items-center gap-3 text-sm font-bold text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {user?.email || "loading..."}
                    </div>
                 </div>
              </div>

              <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 flex items-center justify-between group cursor-pointer hover:bg-green-500/10 transition-all">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/10">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-foreground">Advanced Security</h4>
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Multi-Factor Auth Active</p>
                    </div>
                 </div>
                 <button className="text-xs font-black text-green-500 px-4 py-2 rounded-xl border border-green-500/20 group-hover:bg-green-500 group-hover:text-white transition-all">MANAGE</button>
              </div>
           </div>

           <div className="p-8 rounded-4xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-2xl">
              <h3 className="text-xs font-black text-blue-500/60 uppercase tracking-widest px-1 mb-6">Subscriptions & Billing</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/10 ring-4 ring-blue-500/5 shadow-2xl shadow-blue-500/10">
                       <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-foreground tracking-tighter">Premium Harvest Plan</h4>
                       <p className="text-xs text-muted-foreground font-medium flex items-center gap-2 mt-1">
                          <span className="text-blue-500 font-bold">$49.00 / YEAR</span>
                          <span>•</span>
                          <span>Next invoice: Oct 12, 2026</span>
                       </p>
                    </div>
                 </div>
                 <button className="px-6 py-3 rounded-2xl bg-blue-500 text-white font-black text-[10px] tracking-widest uppercase hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20">UPGRADE</button>
              </div>
           </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-6">
           <div className="p-6 rounded-4xl bg-card/40 border border-border/10 backdrop-blur-3xl shadow-2xl">
              <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-1 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                 {[
                   { label: "Notification Settings", icon: Settings, color: "text-orange-500", bg: "bg-orange-500/10" },
                   { label: "Global Preferences", icon: ShieldCheck, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                   { label: "Regional Context", icon: MapPin, color: "text-rose-500", bg: "bg-rose-500/10" },
                 ].map((action, i) => (
                   <button key={i} className="w-full flex items-center justify-between p-4 rounded-3xl bg-muted/20 hover:bg-muted/40 border border-border/5 transition-all text-left">
                      <div className="flex items-center gap-3">
                         <div className={`w-9 h-9 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center border border-current/10`}>
                            <action.icon className="w-4.5 h-4.5" />
                         </div>
                         <span className="text-xs font-bold text-foreground">{action.label}</span>
                      </div>
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground/40" />
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
