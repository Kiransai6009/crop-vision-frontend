import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Mail, Lock, User, ArrowRight, Leaf, Sprout, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
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
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCooldown = localStorage.getItem("signupCooldown");
    if (storedCooldown) {
      const expirationTime = parseInt(storedCooldown, 10);
      const currentTime = new Date().getTime();
      if (expirationTime > currentTime) {
        setCooldown(Math.ceil((expirationTime - currentTime) / 1000));
      } else {
        localStorage.removeItem("signupCooldown");
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0 && localStorage.getItem("signupCooldown")) {
      localStorage.removeItem("signupCooldown");
      toast.success("Cooldown complete. You may now retry authentication.");
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const startCooldown = () => {
    const expirationTime = new Date().getTime() + 30000; // 30 seconds
    localStorage.setItem("signupCooldown", expirationTime.toString());
    setCooldown(30);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form Validation Before API Call
    if (!email || !email.includes('@')) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (!isLogin && cooldown > 0) {
      setErrorMsg(`Too many attempts. Please wait ${cooldown} seconds and try again.`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: email.trim(), 
          password 
        });
        
        if (error) {
          if (error.status === 429 || error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
            throw new Error("Too many authentication attempts. Please wait before trying again.");
          }
          throw error;
        }

        // Check if user email is confirmed before login (Task #7)
        if (data.user && !data.user.email_confirmed_at) {
           // Force sign out just in case supabase allowed a partial session
           await supabase.auth.signOut();
           throw new Error("Please confirm your email address before logging in.");
        }

        toast.success("Authentication successful. Redirecting to terminal...");
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() || email.split('@')[0] },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        
        startCooldown();
        
        if (error) {
          if (error.status === 429 || error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("too many requests")) {
            throw new Error("Too many attempts. Please wait 30 seconds and try again.");
          }
          throw error;
        }
        
        toast.success("Verification link transmitted. Please check your inbox.", { duration: 5000 });
      }
    } catch (err: any) {
      let message = err.message || "An unexpected error occurred during transmission.";
      
      if (err.message === "Failed to fetch") {
        message = "Network Error: Could not establish a handshake with Supabase Nodes. Double-check your Project ID in .env (" + import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] + ") and ensure your project is not PAUSED or DELETED in the Supabase Dashboard.";
      }
      
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-x-hidden" style={{ background: "#050D0A" }}>
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px]" style={{ background: "rgba(0,255,135,0.06)" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: "linear-gradient(rgba(0,255,135,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.5) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      </div>

      <div className="w-full max-w-md md:max-w-4xl grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="hidden md:flex flex-col justify-center gap-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Leaf className="w-7 h-7 text-[#050D0A]" />
            </div>
            <div>
              <div className="font-display font-black text-2xl text-white tracking-tight">Crop Insight</div>
              <div className="text-xs text-[#10B981] font-bold tracking-widest uppercase">Smart Agriculture</div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-4xl font-black text-white mb-3 tracking-tighter">
              Precision Agriculture <br/><span className="text-gradient-green">Starts Here</span>
            </h2>
            <p className="leading-relaxed text-sm font-medium" style={{ color: "rgba(150,230,180,0.6)" }}>
              Analyze satellite imagery, detect crop disease, predict yields, and monitor live weather.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { icon: Satellite, label: "Satellite NDVI Analysis" },
              { icon: Leaf, label: "Crop Disease Detection" },
              { icon: Sprout, label: "ML Yield Prediction" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 backdrop-blur-md rounded-xl px-4 py-3 border border-white/5 bg-white/5"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,255,135,0.12)" }}>
                   <item.icon className="w-4 h-4 text-[#00FF87]" />
                </div>
                <span className="text-sm font-bold text-white/80">{item.label}</span>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#00FF87] shadow-[0_0_10px_#00FF87] animate-pulse" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="glass-card rounded-[32px] p-6 md:p-10 relative overflow-hidden flex flex-col justify-center w-full max-w-md mx-auto"
          style={{ border: "1px solid rgba(0,255,135,0.18)", boxShadow: "0 0 80px rgba(0,255,135,0.08), 0 32px 64px rgba(0,0,0,0.6)" }}
        >
          <div className="text-center mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-display text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{isLogin ? "Welcome" : "Join Crop Insight"}</h2>
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(150,230,180,0.6)" }}>
                  {isLogin ? "Sign in to continue" : "Create an account to start monitoring your crops"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex p-1 rounded-2xl mb-10 bg-[#00FF87]/5 border border-[#00FF87]/10 backdrop-blur-xl">
            {["Sign In", "Sign Up"].map((tab, i) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(i === 0); setErrorMsg(null); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  isLogin === (i === 0)
                    ? "bg-[#00FF87] text-[#050D0A] shadow-xl shadow-[#00FF87]/20"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {errorMsg && (
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-4 text-red-400"
            >
               <AlertCircle className="w-5 h-5 shrink-0" />
               <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: "rgba(150,230,180,0.7)" }}>Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                    <input
                      className={inputClass}
                      placeholder="e.g. Farmer John"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest mb-2 block" style={{ color: "rgba(150,230,180,0.7)" }}>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                <input type="email" className={inputClass} placeholder="operator@cropvision.io" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-bold uppercase tracking-widest block" style={{ color: "rgba(150,230,180,0.7)" }}>Password</Label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-black text-[#00FF87] hover:underline uppercase tracking-widest opacity-70 hover:opacity-100"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00FF87] opacity-60" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`${inputClass} pr-12`} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  minLength={6} 
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

            <button
              type="submit"
              disabled={loading || (!isLogin && cooldown > 0)}
              className="w-full h-14 rounded-2xl bg-[#00FF87] text-[#050D0A] font-black tracking-[0.2em] transform active:scale-95 transition-all shadow-2xl shadow-[#00FF87]/20 flex items-center justify-center gap-3 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span>
                    {isLogin 
                      ? "SIGN IN" 
                      : cooldown > 0 
                        ? `WAIT ${cooldown}s` 
                        : "CREATE ACCOUNT"}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-10 font-bold uppercase tracking-widest" style={{ color: "rgba(150,230,180,0.4)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#00FF87] hover:underline decoration-2 transition-all">
              {isLogin ? "Register" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
