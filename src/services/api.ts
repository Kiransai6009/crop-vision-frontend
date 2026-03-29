import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add Supabase Token
api.interceptors.request.use((config) => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "udylcriijgnkwxngtgoa";
  const sessionString = localStorage.getItem(`sb-${projectId}-auth-token`);
  try {
    const session = sessionString ? JSON.parse(sessionString) : null;
    const token = session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("Failed to parse auth session", e);
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
    // Fetches from /history (Note: App.py has /history at root for last 10)
    const response = await api.get("/history");
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
