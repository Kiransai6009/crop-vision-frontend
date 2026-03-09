import { useState } from "react";
import { Link } from "react-router-dom";
import { Satellite, BarChart3, CloudRain, Leaf, Microscope, IndianRupee, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/modules", label: "All Modules" },
    { to: "/helpdesk", label: "Help Desk" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Satellite className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">Crop Insight</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/modules"
            className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
          >
            Get Started
          </Link>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 md:hidden rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted text-foreground font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-2 pt-2 border-t border-border">
                <Link
                  to="/modules"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
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

export { motion };
export default Navbar;
export { features, fadeInUp };
