import { Search, Bell, User, Sun, Moon, MapPin, SearchCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useLocation } from "@/hooks/useLocation";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile } = useUser();
  const { locationName, loading } = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 w-full h-16 border-b border-border/50 bg-background/50 backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between h-full px-6 md:px-8">

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-green-500 transition-colors" />
            <input
              type="text"
              placeholder="Search historical yields or satellite data..."
              className="w-full h-10 pl-11 pr-4 rounded-xl text-xs font-semibold bg-muted/40 border border-border/10 focus:ring-2 focus:ring-green-500/20 focus:bg-background/80 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Location Badge */}
          <div 
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20"
            title="Your current location"
          >
            <MapPin className={`w-3.5 h-3.5 text-blue-500 ${loading ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider truncate max-w-[200px]">
              {locationName}
            </span>
          </div>

          <div className="w-px h-6 bg-border/20 mx-1 hidden sm:block" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-green-500"
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl hover:bg-muted/60 transition-colors text-muted-foreground hover:text-green-500">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-green-500 ring-4 ring-background shadow-lg shadow-green-500/20" />
          </button>

          {/* User Profile */}
          <button className="flex items-center gap-3 p-1 rounded-full border border-border/10 hover:bg-muted/60 transition-all pr-4 pl-1 ml-2">
             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shadow-inner">
               <User className="w-4 h-4" />
             </div>
             <div className="hidden lg:flex flex-col items-start leading-none gap-0.5">
               <span className="text-xs font-black text-foreground">{profile?.display_name || user?.email?.split('@')[0] || "Farmer"}</span>
               <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Active Now</span>
             </div>
          </button>
        </div>
      </div>
    </header>
  );
};
