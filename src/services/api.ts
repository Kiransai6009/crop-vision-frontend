import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the JWT Bearer token from localStorage
api.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.warn("[api.ts] Failed to attach auth token:", e);
  }
  return config;
});

export const yieldService = {
  predict: async (data: { crop: string; rainfall?: number; temperature?: number; humidity?: number; ndvi?: number; lat?: number; lon?: number }) => {
    const response = await api.post("/api/predict", data);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get("/api/history");
    return response.data;
  },
  getDashboard: async (lat: number, lon: number, crop: string) => {
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
  getRawData: async (lat: number, lon: number) => {
    const response = await api.get(`/api/dashboard?lat=${lat}&lon=${lon}`);
    return response.data;
  }
};

export const weatherService = {
  getForecast: async (lat: number, lon: number) => {
    const response = await api.get(`/api/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  },
};

export const locationService = {
  sendLocation: async (lat: number, lon: number, locationName: string) => {
    const response = await api.post("/api/location", { lat, lon, location_name: locationName });
    return response.data;
  },
};

export const authService = {
  signup: async (data: any) => {
    const response = await api.post("/api/auth/signup", data);
    return response.data;
  },
  login: async (data: any) => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/forgot-password", { email });
    return response.data;
  },
  resetPassword: async (data: { token: string; new_password: string }) => {
    const response = await api.post("/reset-password", data);
    return response.data;
  },
  updateProfile: async (data: { display_name: string }) => {
    const response = await api.post("/api/profile/update", data);
    return response.data;
  },
  getFAQ: async () => {
    const response = await api.get("/api/faq");
    return response.data;
  },
  submitTicket: async (data: { subject: string; description: string }) => {
    const response = await api.post("/api/support", data);
    return response.data;
  }
};

export const chatService = {
  sendMessage: async (messages: {role: string, content: string}[]) => {
     const response = await api.post("/api/chat", { messages });
     return response.data;
  }
}

export default api;
