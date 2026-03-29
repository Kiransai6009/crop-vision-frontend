import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Lock, Loader2, Save, LogIn, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const ParticleBackground = lazy(() => import("../components/ParticleBackground"));

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
          toast.error("No active session found. Please re-open your reset link.");
          navigate("/auth");
      }
    });
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Credentials do not match.");
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Security credentials updated. Re-authentication required.");
      navigate("/auth");
    } catch (err: any) {
      console.error("Reset Pass Exception:", err);
      const message = err.message === "Failed to fetch" 
        ? "Network Link Error: Handshake timed out." 
        : err.message || "Failed to finalize security reset.";
      
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 transition-all duration-300
    focus:outline-none focus:ring-0
    bg-[rgba(5,13,10,0.8)] border border-[rgba(0,255,135,0.15)]
    focus:border-[rgba(0,255,135,0.6)] focus:shadow-[0_0_0_3px_rgba(0,255,135,0.1),0_0_20px_rgba(0,255,135,0.15)]
    pl-10
  `;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: "#050D0A" }}>
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card rounded-4xl p-10 relative z-10"
        style={{ border: "1px solid rgba(0,255,135,0.18)", boxShadow: "0 0 80px rgba(0,255,135,0.08)" }}
      >
        <div className="text-center mb-10">
           <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-[#00FF87] to-[#60EFFF] flex items-center justify-center mb-6 pulse-glow shadow-2xl shadow-green-500/20">
              <Lock className="w-8 h-8 text-[#050D0A]" />
           </div>
           <h2 className="font-display text-4xl font-black text-white tracking-widest leading-none uppercase">Neural <br/>Secure</h2>
           <p className="text-xs font-black tracking-widest uppercase mt-4 leading-relaxed" style={{ color: "rgba(150,230,180,0.5)" }}>
              Define your new master credential below. Min 6 characters required.
           </p>
        </div>

        {errorMsg && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 text-red-400">
               <ShieldAlert className="w-5 h-5 shrink-0" />
               <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
            </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87] px-1 opacity-60">New Secure Hash</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#00FF87] opacity-60" />
                <input 
                  type="password" 
                  className={inputClass} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
           </div>

           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87] px-1 opacity-60">Confirm Neural Hash</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#00FF87] opacity-60" />
                <input 
                  type="password" 
                  className={inputClass} 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
           </div>

           <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-[#00FF87] text-[#050D0A] font-black tracking-[0.2em] shadow-2xl shadow-green-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 transition-all"
           >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                   <span>UPDATE UPLINK</span>
                   <Save className="w-4 h-4" />
                </>
              )}
           </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
           <button onClick={() => navigate("/auth")} className="text-xs font-black text-muted-foreground hover:text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto transition-colors">
              <LogIn size={16} className="text-[#00FF87]" /> Return to login
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
