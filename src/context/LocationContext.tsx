import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface LocationData {
  lat: number | null;
  lon: number | null;
  locationName: string;
  city: string;
  loading: boolean;
  error: string | null;
  mode: "current" | "district";
  selectedDistrict: string | null;
}

interface LocationContextType extends LocationData {
  refreshLocation: () => void;
  setMode: (mode: "current" | "district") => void;
  setSelectedDistrict: (district: string | null) => void;
}

// Default fallback: Machilipatnam, Andhra Pradesh, India
const FALLBACK = { lat: 16.18, lon: 81.13, locationName: "Machilipatnam, Andhra Pradesh, India", city: "Machilipatnam" };

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<LocationData>({
    lat: null,
    lon: null,
    locationName: "Detecting location...",
    city: "Hyderabad",
    loading: true,
    error: null,
    mode: "current",
    selectedDistrict: null,
  });

  const detectLocation = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // 1. Try cached location first (performance optimization)
    const cached = localStorage.getItem("cropinsight_location");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const age = Date.now() - (parsed._ts || 0);
        // Use cache if less than 30 minutes old
        if (age < 30 * 60 * 1000 && parsed.lat && parsed.lon) {
          setState(prev => ({
            ...prev,
            lat: parsed.lat,
            lon: parsed.lon,
            locationName: parsed.locationName || FALLBACK.locationName,
            city: parsed.city || FALLBACK.city,
            loading: false,
            error: null,
          }));
          // Also send to backend silently
          sendLocationToBackend(parsed.lat, parsed.lon, parsed.locationName);
          return;
        }
      } catch (e) {
        console.warn("Cache parse failed:", e);
      }
    }

    // 2. Use Geolocation API
    if (!navigator.geolocation) {
      applyFallback("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode with Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { "Accept-Language": "en-US,en;q=0.9" } }
          );

          let locationName = FALLBACK.locationName;
          let city = FALLBACK.city;

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            city = address.city || address.town || address.village || address.state_district || FALLBACK.city;
            const stateName = address.state || "";
            const country = address.country || "";
            const parts = [city, stateName, country].filter(Boolean);
            const unique = Array.from(new Set(parts));
            locationName = unique.length > 0 ? unique.join(", ") : FALLBACK.locationName;
          }

          // Cache it
          const cacheData = { lat: latitude, lon: longitude, locationName, city, _ts: Date.now() };
          localStorage.setItem("cropinsight_location", JSON.stringify(cacheData));

          setState(prev => ({
            ...prev,
            lat: latitude,
            lon: longitude,
            locationName,
            city,
            loading: false,
            error: null,
          }));

          // Send to backend
          sendLocationToBackend(latitude, longitude, locationName);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          // Still use coords even if geocoding fails
          const cacheData = { lat: latitude, lon: longitude, locationName: FALLBACK.locationName, city: FALLBACK.city, _ts: Date.now() };
          localStorage.setItem("cropinsight_location", JSON.stringify(cacheData));

          setState(prev => ({
            ...prev,
            lat: latitude,
            lon: longitude,
            locationName: FALLBACK.locationName,
            city: FALLBACK.city,
            loading: false,
            error: "Reverse geocoding failed",
          }));
          sendLocationToBackend(latitude, longitude, FALLBACK.locationName);
        }
      },
      (err) => {
        console.warn(`Geolocation ERROR(${err.code}): ${err.message}`);
        applyFallback(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const applyFallback = (errorMsg: string) => {
    const cacheData = { ...FALLBACK, _ts: Date.now() };
    localStorage.setItem("cropinsight_location", JSON.stringify(cacheData));
    setState(prev => ({
      ...prev,
      lat: FALLBACK.lat,
      lon: FALLBACK.lon,
      locationName: FALLBACK.locationName,
      city: FALLBACK.city,
      loading: false,
      error: errorMsg,
    }));
  };

  const sendLocationToBackend = async (lat: number, lon: number, locationName: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return;
      await fetch(`${API_BASE_URL}/api/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lon, location_name: locationName }),
      });
    } catch (e) {
      // Silent fail — location sync is non-critical
      console.warn("Location sync to backend failed:", e);
    }
  };

  // Initial detection on mount
  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const setMode = (mode: "current" | "district") => {
    setState(prev => ({ ...prev, mode }));
  };

  const setSelectedDistrict = (district: string | null) => {
    setState(prev => ({ ...prev, selectedDistrict: district }));
  };

  const refreshLocation = useCallback(() => {
    // Clear cache and re-detect
    localStorage.removeItem("cropinsight_location");
    detectLocation();
  }, [detectLocation]);

  return (
    <LocationContext.Provider value={{ ...state, refreshLocation, setMode, setSelectedDistrict }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useGlobalLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useGlobalLocation must be used within a LocationProvider");
  }
  return context;
};