import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, MapPin, Thermometer } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-satellite.jpg";
import Navbar, { features, fadeInUp } from "@/components/Navbar";

const stats = [
  { label: "Accuracy Rate", value: "94.7%", icon: TrendingUp },
  { label: "Districts Covered", value: "120+", icon: MapPin },
  { label: "Data Points", value: "2.4M", icon: Thermometer },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Satellite view of farmland"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-hero-gradient opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={0}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary-foreground text-xs font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              Powered by Satellite Intelligence
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={1}
              className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6"
              style={{ color: "hsl(0 0% 100%)" }}
            >
              Crop Insight —{" "}
              <span className="text-gradient-primary">AI-Powered Farm Intelligence</span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={2}
              className="text-lg md:text-xl max-w-xl mb-8"
              style={{ color: "hsl(150 10% 70%)" }}
            >
              Harness Sentinel-2 &amp; Landsat satellite imagery, live weather data, AI disease detection,
              and machine learning to predict crop yields and market prices.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/modules"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-elevated"
              >
                Explore All Modules
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border/50 font-semibold hover:bg-card/10 transition-colors"
                style={{ color: "hsl(150 10% 80%)" }}
              >
                Learn More
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              custom={4}
              className="flex flex-wrap gap-8 mt-16"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-xl" style={{ color: "hsl(0 0% 100%)" }}>
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: "hsl(150 10% 60%)" }}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Analysis Pipeline
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From satellite data collection to ML-powered predictions, every step is automated and optimized.
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
                className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-shadow duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Optimize Your Harvest?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start with satellite analysis, AI disease detection, and real-time market prices — all in one platform.
            </p>
            <Link
              to="/modules"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity shadow-elevated"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 Crop Insight — AI-Powered Agricultural Intelligence Platform
        </div>
      </footer>
    </div>
  );
};

export default Index;
