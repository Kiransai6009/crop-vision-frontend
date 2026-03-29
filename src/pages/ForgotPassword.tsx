import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const ParticleBackground = lazy(() => import("../components/ParticleBackground"));

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Security reset link transmitted. Terminal access updated.");
    } catch (err: any) {
      console.error("Forgot Pass Exception:", err);
      const message = err.message === "Failed to fetch" 
        ? "Network Handshake Failed: Supabase Node unreachable." 
        : err.message || "Failed to transmit reset signal.";
      
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
        style={{ border: "1px solid rgba(0,255,135,0.18)", boxShadow: "0 0 60px rgba(0,255,135,0.07)" }}
      >
        <button onClick={() => navigate("/auth")} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00FF87] hover:underline mb-10 transition-all opacity-70 hover:opacity-100">
           <ArrowLeft size={16} /> Back to Sign In
        </button>

        <div className="text-center mb-10">
           <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-br from-[#00FF87] to-[#60EFFF] flex items-center justify-center mb-6 pulse-glow shadow-2xl shadow-green-500/20">
              <Mail className="w-8 h-8 text-[#050D0A]" />
           </div>
           <h2 className="font-display text-4xl font-black text-white tracking-tighter uppercase leading-none">Access <br/>Uplink</h2>
           <p className="text-xs font-black uppercase tracking-widest mt-4 leading-relaxed" style={{ color: "rgba(150,230,180,0.5)" }}>
              Transmit your email to receive a secure credentials reset packet.
           </p>
        </div>

        {errorMsg && (
            <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 text-red-400">
               <AlertCircle className="w-5 h-5 shrink-0" />
               <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
            </div>
        )}

        <form onSubmit={handleReset} className="space-y-6">
           <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87] px-1 opacity-60">Operator Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#00FF87] opacity-60" />
                <input 
                  type="email" 
                  className={inputClass} 
                  placeholder="operator@cropvision.io" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
           </div>

           <button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-[#00FF87] text-[#050D0A] font-black uppercase tracking-[0.2em] shadow-2xl shadow-green-500/20 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 transition-all"
           >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                   <span>INITIATE RESET</span>
                   <Send className="w-4 h-4" />
                </>
              )}
           </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
