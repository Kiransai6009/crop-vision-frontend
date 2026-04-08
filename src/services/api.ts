import axios from "axios";
import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the Supabase JWT Bearer token
api.interceptors.request.use(async (config) => {
  try {
    // Strategy 1: Get token directly from the supabase client session (most reliable)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    }

    // Strategy 2: Fallback — read from localStorage using correct project ID
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "ckgevpkjjxlrvfuhlyaw";
    const sessionString = localStorage.getItem(`sb-${projectId}-auth-token`);
    const session2 = sessionString ? JSON.parse(sessionString) : null;
    const token = session2?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("[api.ts] Failed to attach auth token:", e);
  }
  return config;
});

export const yieldService = {
  predict: async (data: { crop: string; rainfall?: number; temperature?: number; humidity?: number; ndvi?: number }) => {
    // Note: Backend uses /api/predict for POST
    const response = await api.post("/api/predict", data);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get("/api/history");
    return response.data;
  },
  getDashboard: async (lat: number, lon: number, crop: string) => {
    // Unified dashboard call
    const response = await api.get(`/api/dashboard?lat=${lat}&lon=${lon}&crop=${crop}`);
    return response.data;
  },
  calculateProfit: async (data: { yield_per_ha: number; area_ha: number; price_per_ton: number }) => {
    const response = await api.post("/api/profit", data);
    return response.data;
  },
  calculateFertilizer: async (ndvi: number) => {
    const response = await api.post("/api/fertilizer", { ndvi });
    return response.data;
  }
};

export const satelliteService = {
  getNDVI: async (lat: number, lon: number, start: string, end: string) => {
    const response = await api.post("/ndvi", { lat, lon, start, end });
    return response.data;
  },
  getRawData: async () => {
    // Current backend doesn't have a dedicated /raw-satellite, so we'll 
    // use /api/dashboard with default coords to get current status.
    const response = await api.get("/api/dashboard?lat=18.5204&lon=73.8567");
    return response.data;
  }
};

export const weatherService = {
  getForecast: async (lat: number, lon: number) => {
    const response = await api.get(`/api/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  },
};

export const authService = {
  forgotPassword: async (email: string) => {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await api.post("/reset-password", data);
    return response.data;
  },
};

export const chatService = {
  sendMessage: async (messages: {role: string, content: string}[]) => {
     const response = await api.post("/api/chat", { messages });
     return response.data;
  }
}

export default api;
