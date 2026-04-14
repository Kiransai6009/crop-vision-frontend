import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  display_name: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  signOut: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const resp = await axios.get(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(resp.data);
        } catch (err) {
          console.error("Session restoration failed", err);
          localStorage.removeItem("auth_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("auth_token", token);
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, login, signOut }}>
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
