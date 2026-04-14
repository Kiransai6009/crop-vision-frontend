import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { authService } from "@/services/api";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Mail, Lock, User, ArrowRight, Leaf, Sprout, Loader2, AlertCircle, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { lazy, Suspense } from "react";

const ParticleBackground = lazy(() => import("../components/ParticleBackground"));

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!trimmedPassword || trimmedPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const data = await authService.login({ 
          email: trimmedEmail, 
          password: trimmedPassword 
        });
        
        login(data.token, data.user);
        toast.success("Authentication successful. Redirecting...");
        navigate("/dashboard");
      } else {
        const data = await authService.signup({
          email: trimmedEmail,
          password: trimmedPassword,
          display_name: displayName.trim()
        });
        
        login(data.token, data.user);
        toast.success("Account created! Redirecting...");
        navigate("/dashboard");
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "An unexpected error occurred during transmission.";
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-6" style={{ background: "#050D0A" }}>
      {/* Background elements omitted for brevity, keeping same styles as original */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Suspense fallback={null}>
          <ParticleBackground />
        </Suspense>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px]" style={{ background: "rgba(0,255,135,0.06)" }} />
      </div>

      <div className="w-full max-w-md md:max-w-4xl grid md:grid-cols-2 gap-8 md:gap-12 relative z-10 my-auto">
        {/* Branding Column */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="hidden md:flex flex-col justify-center gap-8">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center">
               <Leaf className="w-7 h-7 text-[#050D0A]" />
             </div>
             <div>
               <div className="font-display font-black text-2xl text-white tracking-tight">Crop Insight</div>
               <div className="text-xs text-[#10B981] font-bold tracking-widest uppercase">Powered by MongoDB</div>
             </div>
           </div>
           <h2 className="font-display text-4xl font-black text-white tracking-tighter">Precision Agriculture <br/><span className="text-gradient-green">Starts Here</span></h2>
        </motion.div>

        {/* Auth Form Column */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="glass-card rounded-[32px] p-6 md:p-10 border border-[#00FF87]/20 shadow-2xl">
          <div className="text-center mb-10">
             <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight underline decoration-[#00FF87]/30">
               {isLogin ? "Welcome Back" : "Join Crop Insight"}
             </h2>
          </div>

          <div className="flex p-1 rounded-2xl mb-8 bg-white/5 border border-white/5">
              {["Sign In", "Sign Up"].map((tab, i) => (
                <button key={tab} onClick={() => { setIsLogin(i === 0); setErrorMsg(null); }} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isLogin === (i === 0) ? "bg-[#00FF87] text-[#050D0A]" : "text-gray-500 hover:text-white"}`}>
                  {tab}
                </button>
              ))}
          </div>

          {errorMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-bold flex gap-3">
               <AlertCircle size={16} /> {errorMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87]/70">Display Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                  <input className={inputClass} placeholder="e.g. John Doe" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87]/70">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                <input type="email" className={inputClass} placeholder="operator@cropvision.io" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-[#00FF87]/70">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                <input type={showPassword ? "text" : "password"} className={inputClass} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FF87]/60 hover:text-[#00FF87] transition-colors focus:outline-none">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-[#00FF87] text-[#050D0A] font-black tracking-[0.2em] transform active:scale-95 transition-all shadow-xl shadow-[#00FF87]/20 flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <> {isLogin ? "SIGN IN" : "CREATE ACCOUNT"} <ArrowRight size={18} /> </>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
