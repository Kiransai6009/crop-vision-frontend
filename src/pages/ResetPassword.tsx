import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Lock, Leaf, Loader2, ArrowLeft, ShieldCheck, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const ParticleBackground = lazy(() => import("../components/ParticleBackground"));

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a session to update the password
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired session. Please request a new reset link.");
        navigate("/forgot-password");
      }
    };
    checkSession();
  }, [navigate]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setResetSuccess(true);
      toast.success("Password updated successfully!");
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/auth");
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
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

          {!resetSuccess ? (
            <>
              <div className="text-center mb-10">
                <h2 className="font-display text-2xl font-black text-white tracking-tight uppercase mb-2">Update Password</h2>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "rgba(150,230,180,0.6)" }}>
                  Create a new strong password for your account
                </p>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(150,230,180,0.7)" }}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      className={`${inputClass} pr-12`} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF87] opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: "rgba(150,230,180,0.7)" }}>Confirm New Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className={`${inputClass} pr-12`} 
                      placeholder="••••••••" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF87] opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
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
                      <span>UPDATE PASSWORD</span>
                      <ShieldCheck className="w-5 h-5" />
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
              <h2 className="font-display text-2xl font-black text-white tracking-widest uppercase mb-4">Update Successful</h2>
              <p className="text-sm font-medium text-[rgba(150,230,180,0.7)] leading-relaxed mb-8">
                Your credentials have been successfully updated. 
                Returning to main terminal for re-authentication.
              </p>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-[#00FF87] animate-spin" />
              </div>
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

export default ResetPassword;
