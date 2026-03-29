import { motion, useInView } from "framer-motion";
import { ArrowRight, TrendingUp, MapPin, Thermometer, Zap, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import Navbar, { features, fadeInUp } from "@/components/Navbar";

/* ── Animated Counter ─────────────────────────── */
function AnimatedCounter({ target, suffix = "" }: { target: number | string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const isString = typeof target === "string";

  useEffect(() => {
    if (!isInView || isString) return;
    const num = target as number;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(num / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, isString]);

  return (
    <span ref={ref} className="counter-value">
      {isString ? target : count}{suffix}
    </span>
  );
}

const stats = [
  { label: "Accuracy Rate", value: 94, suffix: ".7%", icon: TrendingUp },
  { label: "Districts Covered", value: "120+", suffix: "", icon: MapPin },
  { label: "Data Points", value: "2.4M", suffix: "", icon: Thermometer },
];

const benefits = [
  { icon: Zap, title: "Real-time Analysis", desc: "Instant satellite data processing" },
  { icon: Shield, title: "Precision ML", desc: "94.7% prediction accuracy" },
  { icon: Globe, title: "Pan-India Coverage", desc: "120+ districts monitored" },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-all duration-300">
      <Navbar />

      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative flex-1 flex items-center justify-center overflow-hidden py-10 md:py-16 lg:py-20">
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] rounded-full blur-[140px] bg-primary/10" />
           <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px] bg-sky-500/10" />
           <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }} />
        </div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={0}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 border border-primary/20 bg-primary/5 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-primary text-[10px] font-bold tracking-widest uppercase">Precision Agriculture Powered by AI</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial="hidden" animate="visible" variants={fadeInUp} custom={1}
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-4 tracking-tight"
            >
              Grow Smarter with<br />
              <span className="text-gradient-green glow-text-green">AI Crop Intelligence</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p initial="hidden" animate="visible" variants={fadeInUp} custom={2}
              className="text-base sm:text-lg md:text-xl max-w-2xl mb-8 text-muted-foreground leading-relaxed"
            >
              Harness Sentinel-2 satellite imagery, live weather data, and machine learning to predict crop yields and monitor health with 94.7% precision.
            </motion.p>

            {/* CTA */}
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={3} className="flex flex-wrap items-center justify-center gap-4 mb-20">
              <Link to="/modules" className="inline-flex h-12 items-center gap-2 px-8 py-2 rounded-xl text-sm font-bold btn-glow transition-transform active:scale-95 shadow-lg">
                Explore Modules <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="inline-flex h-12 items-center gap-2 px-8 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors">
                Learn More
              </a>
            </motion.div>

            {/* Stats row (compact) */}
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} custom={4} className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12 pt-8 border-t border-border/40 w-full max-w-3xl">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-center md:justify-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/10">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-display font-bold text-2xl leading-none">
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] font-medium mt-1 text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating benefit badges */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.15 }}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 shadow-xl border-border/10 min-w-[240px]"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/10">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-black tracking-tight">{b.title}</div>
                <div className="text-[11px] text-muted-foreground font-medium">{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features Section ────────────────────────── */}
      <section id="features" className="py-28 relative">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: "rgba(0,255,135,0.08)", border: "1px solid rgba(0,255,135,0.2)" }}>
              <span className="text-[#00FF87] text-xs font-bold tracking-widest uppercase">Complete Pipeline</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to
              <span className="text-gradient-green"> Grow Smarter</span>
            </h2>
            <p className="max-w-lg mx-auto" style={{ color: "rgba(150,230,180,0.6)" }}>
              From satellite data collection to ML-powered predictions — every step automated and optimized.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                custom={i}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group glass-card rounded-2xl p-8 border-glow scan-line cursor-default"
                style={{ willChange: "transform" }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(0,255,135,0.1)", border: "1px solid rgba(0,255,135,0.2)" }}>
                  <feature.icon className="w-7 h-7 text-[#00FF87]" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-3 group-hover:text-[#00FF87] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(150,230,180,0.6)" }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,255,135,0.07) 0%, transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className="inline-block glass-card rounded-3xl p-16 glow-green" style={{ maxWidth: 700, willChange: "transform" }}>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Optimize
                <span className="text-gradient-green"> Your Harvest?</span>
              </h2>
              <p className="mb-10 max-w-md mx-auto" style={{ color: "rgba(150,230,180,0.65)" }}>
                Start with satellite analysis, AI disease detection, and real-time market prices — all in one platform.
              </p>
              <Link to="/modules" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl btn-glow text-lg font-black">
                Get Started Free <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="py-10" style={{ borderTop: "1px solid rgba(0,255,135,0.08)" }}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00FF87] to-[#60EFFF] flex items-center justify-center">
              <span className="text-[#050D0A] font-black text-xs">CI</span>
            </div>
            <span className="text-sm font-bold text-white">Crop Insight Hub</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(150,230,180,0.4)" }}>
            © 2026 Crop Insight — AI-Powered Agricultural Intelligence Platform
          </p>
          <div className="flex gap-4 text-xs" style={{ color: "rgba(150,230,180,0.4)" }}>
            <Link to="/modules" className="hover:text-[#00FF87] transition-colors">Modules</Link>
            <Link to="/dashboard" className="hover:text-[#00FF87] transition-colors">Dashboard</Link>
            <Link to="/auth" className="hover:text-[#00FF87] transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
