import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Leaf, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const ParticleBackground = lazy(() => import("../components/ParticleBackground"));

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setSubmitted(true);
      toast.success("Password reset link sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link.");
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

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px]" style={{ background: "rgba(0,255,135,0.06)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-[32px] p-8 md:p-10 relative overflow-hidden" 
             style={{ border: "1px solid rgba(0,255,135,0.18)", boxShadow: "0 0 80px rgba(0,255,135,0.08)" }}>
          
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Leaf className="w-8 h-8 text-[#050D0A]" />
            </div>
          </div>

          {!submitted ? (
            <>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase mb-2">Reset Password</h2>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(150,230,180,0.6)" }}>
                  Enter your email to receive recovery instructions
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: "rgba(150,230,180,0.7)" }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
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
                  className="w-full h-14 rounded-2xl bg-[#00FF87] text-[#050D0A] font-black tracking-[0.2em] transform active:scale-95 transition-all shadow-2xl shadow-[#00FF87]/20 flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <span>SEND RESET LINK</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-[#00FF87]" />
              </div>
              <h2 className="font-display text-2xl font-black text-white tracking-widest uppercase mb-4">Transmission Sent</h2>
              <p className="text-sm font-medium text-[rgba(150,230,180,0.7)] leading-relaxed mb-8">
                A secure reset link has been dispatched to <span className="text-white font-bold">{email}</span>. 
                Please verify your inbox to continue the recovery process.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-xs font-black text-[#00FF87] hover:underline uppercase tracking-widest"
              >
                Try a different email?
              </button>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <Link to="/auth" className="inline-flex items-center gap-2 text-xs font-bold text-[#00FF87] hover:underline uppercase tracking-widest">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
