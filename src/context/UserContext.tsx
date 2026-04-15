import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  display_name: string | null;
}

interface Profile {
  display_name: string | null;
  role: string;
}

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (token: string) => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = resp.data;
      setUser({ id: data.id, email: data.email, display_name: data.display_name });
      setProfile({ display_name: data.display_name, role: data.role || "USER" });
    } catch (err) {
      console.error("Session restoration failed", err);
      localStorage.removeItem("auth_token");
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        await fetchProfile(token);
      }
      setLoading(false);
    };
    initAuth();
  }, [fetchProfile]);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
    setProfile({ display_name: userData.display_name, role: "USER" });
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("cropinsight_location");
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      await fetchProfile(token);
    }
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ user, profile, loading, login, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
