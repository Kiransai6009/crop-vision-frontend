import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, LayoutGrid, Layers, Satellite, TrendingUp,
  CloudSun, Sprout, User, MessageSquare, ClipboardList,
  Settings, Menu, X, LogOut, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useSidebar } from "@/context/SidebarContext";

interface NavItem {
  name: string;
  icon: React.ElementType;
  path: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { name: "Home",              icon: Home,         path: "/home" },
      { name: "Dashboard",         icon: LayoutGrid,   path: "/dashboard" },
      { name: "Modules Dashboard", icon: Layers,       path: "/modules" },
    ],
  },
  {
    label: "ANALYSIS",
    items: [
      { name: "Satellite Data",        icon: Satellite,   path: "/satellite" },
      { name: "NDVI Analysis",         icon: TrendingUp,  path: "/ndvi" },
      { name: "Weather Analytics",     icon: CloudSun,    path: "/weather" },
      { name: "Crop Yield Prediction", icon: Sprout,      path: "/yield-prediction" },
    ],
  },
  {
    label: "USER",
    items: [
      { name: "User Profile",        icon: User,          path: "/profile" },
      { name: "HelpDesk",           icon: MessageSquare, path: "/helpdesk" },
      { name: "Prediction History",  icon: ClipboardList, path: "/history" },
    ],
  },
];

export const Sidebar = () => {
  const { isExpanded, isMobile, isOpen, setIsOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useUser();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <motion.aside
        initial={false}
        animate={{
          width: isExpanded && !isMobile ? 260 : 80,
          x: isMobile && !isOpen ? -260 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 h-full z-50 flex flex-col bg-card/40 backdrop-blur-2xl transition-all duration-300",
          !isMobile && "border-none", 
          isMobile ? "w-[260px]" : ""
        )}
      >
        {/* Header (Borderless) */}
        <div className="h-20 flex items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 min-w-[40px] rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-3xl shadow-green-500/5 ring-1 ring-green-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            {(isExpanded || isMobile) && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display font-black text-sm text-foreground tracking-tighter whitespace-nowrap"
              >
                CROP INSIGHT.
              </motion.span>
            )}
          </Link>
          
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors md:mr-1"
          >
            {isMobile || isExpanded ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* User Info */}
        {(isExpanded || isMobile) && (
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/20 border border-border/5 group cursor-pointer hover:bg-muted/30 transition-all">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-xl shadow-green-500/20 scale-95 group-hover:scale-100 transition-transform">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-black text-foreground truncate ">{user?.email?.split('@')[0] || "Farmer"}</span>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter opacity-60">Verified Admin</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-8">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-1">
              {(isExpanded || isMobile) && (
                <span className="px-3 text-[10px] font-black text-muted-foreground/30 uppercase tracking-[.25em] mb-4 block leading-none">
                  {section.label}
                </span>
              )}
              {section.items.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-3.5 h-12 rounded-2xl transition-all duration-300 group relative",
                      isActive 
                        ? "bg-green-500/10 text-green-500 shadow-xl shadow-green-500/5 ring-1 ring-green-500/10" 
                        : "text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900/10 hover:text-green-600 dark:hover:text-green-400"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 shrink-0 transition-transform", 
                      isActive && "scale-110 drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]"
                    )} />
                    {(isExpanded || isMobile) && (
                      <span className="text-sm font-black tracking-tight whitespace-nowrap">{item.name}</span>
                    )}

                    {/* Left highlight for active */}
                    {isActive && (
                      <div className="absolute left-[-10px] w-1.5 h-6 rounded-full bg-green-500 shadow-xl shadow-green-500" />
                    )}

                    {/* Tooltip for collapsed desktop sidebar */}
                    {!isExpanded && !isMobile && (
                      <div className="absolute left-[calc(100%+20px)] px-4 py-2 bg-zinc-900 text-white text-[11px] font-black rounded-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none transition-all duration-300 z-50 whitespace-nowrap uppercase tracking-widest shadow-3xl">
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Area */}
        <div className="p-4 space-y-1 mb-4">
          <Link
            to="/settings"
            onClick={() => isMobile && setIsOpen(false)}
            className={cn(
              "flex items-center gap-4 px-3.5 h-12 rounded-2xl transition-all duration-300",
              location.pathname === "/settings" 
                ? "bg-green-500/10 text-green-500 shadow-xl shadow-green-500/5 ring-1 ring-green-500/10" 
                : "text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900/10 hover:text-green-600 dark:hover:text-green-400"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {(isExpanded || isMobile) && <span className="text-sm font-black tracking-tight">Settings</span>}
          </Link>
          
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-4 px-3.5 h-12 rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(isExpanded || isMobile) && <span className="text-sm font-black tracking-tight">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Floating Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-6 left-6 z-50 p-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/10 shadow-3xl text-foreground hover:scale-110 active:scale-95 transition-all"
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
};
