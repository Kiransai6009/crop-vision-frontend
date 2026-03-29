import React, { lazy, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";
import { useSidebar } from "@/context/SidebarContext";

const ParticleBackground = lazy(() => import("../ParticleBackground"));

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isExpanded, isMobile } = useSidebar();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-green-500/30 selection:text-green-200">
      {/* Background Layer */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 pointer-events-none z-0 opacity-30 dark:opacity-40">
           <ParticleBackground />
        </div>
      </Suspense>

      {/* Decorative Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-green-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 h-full relative z-10 transition-all duration-300"
        style={{ 
          paddingLeft: isMobile ? 0 : (isExpanded ? 260 : 80) 
        }}
      >
        <Header />
        
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-[1600px] mx-auto px-6 md:px-10 py-8 lg:py-10"
          >
            <div className="flex flex-col gap-6 md:gap-10">
              {children}
            </div>
          </motion.div>
          
          <footer className="mt-auto py-8 px-10 border-t border-border/5 opacity-40">
             <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">© 2026 CROP INSIGHT HUB — PRECISION AG-TECH</span>
                <div className="flex gap-6">
                   <span className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-green-500 transition-colors uppercase tracking-tighter">Documentation</span>
                   <span className="text-[10px] font-bold text-muted-foreground cursor-pointer hover:text-green-500 transition-colors uppercase tracking-tighter">Support API</span>
                </div>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
