import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, Leaf, BarChart3, Microscope, Menu, X, ArrowRight, Sun, Moon, CloudRain, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

export const features = [
  {
    icon: Satellite,
    title: "Satellite Analysis",
    description: "NDVI & EVI indices from Sentinel-2 and Landsat 8. Soil moisture estimation, crop stress detection, and vegetation mapping.",
  },
  {
    icon: BarChart3,
    title: "AI Yield Prediction",
    description: "Advanced Random Forest and CNN models trained on historical yield data combined with live satellite imagery.",
  },
  {
    icon: Microscope,
    title: "Disease Detection",
    description: "Upload crop leaf images for AI-powered disease identification (ResNet-50 / YOLO) with treatment recommendations.",
  },
  {
    icon: CloudRain,
    title: "Live Weather",
    description: "Real-time weather from Open-Meteo API: temperature, rainfall, humidity, UV index, and 7-day forecasts.",
  },
  {
    icon: Leaf,
    title: "Crop Health",
    description: "NDVI-based crop health monitoring with gauge visualization, monthly trends, and actionable recommendations.",
  },
  {
    icon: IndianRupee,
    title: "Market Prices",
    description: "Live Agmarknet market prices with ML-powered price prediction and optimal sell-timing recommendations.",
  },
];

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const NavLink = ({ to, label, icon: Icon, isActive, onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 relative",
      isActive 
        ? "text-primary bg-primary/10 border border-primary/20 shadow-sm shadow-primary/5" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    )}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </Link>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  const location = useLocation();

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { to: "/home", label: "Home", icon: Leaf },
    { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { to: "/modules", label: "Modules", icon: Satellite },
    { to: "/helpdesk", label: "Help Desk", icon: Microscope },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 h-14">
      <div className="container max-w-7xl mx-auto flex items-center justify-between h-full px-4 md:px-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <Satellite className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight leading-none text-foreground">Crop Insight</span>
            <span className="text-[9px] text-primary font-bold tracking-[0.1em] uppercase mt-0.5">Intelligence Hub</span>
          </div>
        </Link>

        {/* Desktop Nav (Compact) */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-muted/30 border border-border/40 shadow-inner">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              {...link}
              isActive={location.pathname === link.to}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
            title={isDark ? "Light mode" : "Dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link to="/auth" className="hidden sm:inline-flex h-9 items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-bold btn-glow transition-transform active:scale-95">
            Sign In <ArrowRight size={14} />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 md:hidden rounded-lg hover:bg-muted text-muted-foreground transition-all"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav (Drawer style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border z-50 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  {...link}
                  isActive={location.pathname === link.to}
                  onClick={() => setIsOpen(false)}
                />
              ))}
              <div className="mt-3 pt-3 border-t border-border">
                <Link 
                  to="/auth" 
                  onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-center gap-2 h-10 rounded-lg btn-glow text-sm font-bold shadow-md"
                >
                  Get Started <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
