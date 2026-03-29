import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050D0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
        <p className="text-sm font-black text-muted-foreground uppercase tracking-widest animate-pulse">
           Authenticating Neural Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
