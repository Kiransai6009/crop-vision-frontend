import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Context Providers
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { SidebarProvider } from "./context/SidebarContext";

// Auth Guard
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Layouts
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import HelpDesk from "./pages/HelpDesk";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import ModulesDashboard from "./pages/ModulesDashboard";
import SatelliteData from "./pages/SatelliteData";
import NDVIAnalysis from "./pages/NDVIAnalysis";
import WeatherAnalytics from "./pages/WeatherAnalytics";
import CropYieldPrediction from "./pages/CropYieldPrediction";
import UserProfile from "./pages/UserProfile";
import PredictionHistory from "./pages/PredictionHistory";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ThemeProvider>
          <SidebarProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Landing */}
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Protected Dashboard Routes wrapped in DashboardLayout */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/modules" element={<ProtectedRoute><DashboardLayout><ModulesDashboard /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/satellite" element={<ProtectedRoute><DashboardLayout><SatelliteData /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/ndvi" element={<ProtectedRoute><DashboardLayout><NDVIAnalysis /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/weather" element={<ProtectedRoute><DashboardLayout><WeatherAnalytics /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/yield-prediction" element={<ProtectedRoute><DashboardLayout><CropYieldPrediction /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><DashboardLayout><UserProfile /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/helpdesk" element={<ProtectedRoute><DashboardLayout><HelpDesk /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/history" element={<ProtectedRoute><DashboardLayout><PredictionHistory /></DashboardLayout></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SidebarProvider>
        </ThemeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
