/**
 * useLiveWeather.ts
 * ─────────────────────────────────────────────────────────────────────
 * Custom React hook that fetches REAL live weather data from Open-Meteo
 * (https://open-meteo.com) — completely FREE, no API key needed.
 *
 * Returns:
 *   current  — temperature, humidity, rainfall, wind speed, UV index
 *   forecast — 7-day daily forecast (temp min/max, rain, humidity)
 *   ndvi     — computed seasonal NDVI estimate from weather signals
 *   status   — "loading" | "live" | "error"
 * ─────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";

/* ── District lat/lon lookup ────────────────────────────────────────── */
export const DISTRICT_COORDS: Record<string, { lat: number; lon: number; state: string }> = {
    // Andhra Pradesh
    "Guntur": { lat: 16.3, lon: 80.4, state: "Andhra Pradesh" },
    "Vijayawada": { lat: 16.5, lon: 80.6, state: "Andhra Pradesh" },
    "Visakhapatnam": { lat: 17.7, lon: 83.2, state: "Andhra Pradesh" },
    "Kurnool": { lat: 15.8, lon: 78.1, state: "Andhra Pradesh" },
    "Tirupati": { lat: 13.6, lon: 79.4, state: "Andhra Pradesh" },
    "NTR": { lat: 16.5, lon: 80.6, state: "Andhra Pradesh" },
    "Anantapur": { lat: 14.7, lon: 77.6, state: "Andhra Pradesh" },
    "Nellore": { lat: 14.4, lon: 80.0, state: "Andhra Pradesh" },
    "Chittoor": { lat: 13.2, lon: 79.1, state: "Andhra Pradesh" },
    "Krishna (Machilipatnam)": { lat: 16.18, lon: 81.13, state: "Andhra Pradesh" },
    // Telangana
    "Hyderabad": { lat: 17.4, lon: 78.5, state: "Telangana" },
    "Karimnagar": { lat: 18.4, lon: 79.1, state: "Telangana" },
    "Warangal": { lat: 18.0, lon: 79.6, state: "Telangana" },
    "Nizamabad": { lat: 18.7, lon: 78.1, state: "Telangana" },
    "Khammam": { lat: 17.2, lon: 80.1, state: "Telangana" },
    // Maharashtra
    "Mumbai": { lat: 19.1, lon: 72.9, state: "Maharashtra" },
    "Pune": { lat: 18.5, lon: 73.9, state: "Maharashtra" },
    "Nashik": { lat: 20.0, lon: 73.8, state: "Maharashtra" },
    "Nagpur": { lat: 21.1, lon: 79.1, state: "Maharashtra" },
    "Aurangabad": { lat: 19.9, lon: 75.3, state: "Maharashtra" },
    "Solapur": { lat: 17.7, lon: 75.9, state: "Maharashtra" },
    // Punjab
    "Amritsar": { lat: 31.6, lon: 74.9, state: "Punjab" },
    "Ludhiana": { lat: 30.9, lon: 75.9, state: "Punjab" },
    "Patiala": { lat: 30.3, lon: 76.4, state: "Punjab" },
    "Jalandhar": { lat: 31.3, lon: 75.6, state: "Punjab" },
    // Rajasthan
    "Jaipur": { lat: 26.9, lon: 75.8, state: "Rajasthan" },
    "Jodhpur": { lat: 26.3, lon: 73.0, state: "Rajasthan" },
    "Udaipur": { lat: 24.6, lon: 73.7, state: "Rajasthan" },
    "Kota": { lat: 25.2, lon: 75.9, state: "Rajasthan" },
    "Bikaner": { lat: 28.0, lon: 73.3, state: "Rajasthan" },
    // Uttar Pradesh
    "Lucknow": { lat: 26.8, lon: 80.9, state: "Uttar Pradesh" },
    "Kanpur": { lat: 26.5, lon: 80.3, state: "Uttar Pradesh" },
    "Varanasi": { lat: 25.3, lon: 83.0, state: "Uttar Pradesh" },
    "Agra": { lat: 27.2, lon: 78.0, state: "Uttar Pradesh" },
    "Meerut": { lat: 28.9, lon: 77.7, state: "Uttar Pradesh" },
    // Madhya Pradesh
    "Bhopal": { lat: 23.3, lon: 77.4, state: "Madhya Pradesh" },
    "Indore": { lat: 22.7, lon: 75.9, state: "Madhya Pradesh" },
    "Jabalpur": { lat: 23.2, lon: 79.9, state: "Madhya Pradesh" },
    "Gwalior": { lat: 26.2, lon: 78.2, state: "Madhya Pradesh" },
    // Karnataka
    "Bengaluru": { lat: 12.9, lon: 77.6, state: "Karnataka" },
    "Mysuru": { lat: 12.3, lon: 76.6, state: "Karnataka" },
    "Hubballi": { lat: 15.4, lon: 75.1, state: "Karnataka" },
    "Mangaluru": { lat: 12.9, lon: 74.8, state: "Karnataka" },
    // Tamil Nadu
    "Chennai": { lat: 13.1, lon: 80.3, state: "Tamil Nadu" },
    "Coimbatore": { lat: 11.0, lon: 77.0, state: "Tamil Nadu" },
    "Madurai": { lat: 9.9, lon: 78.1, state: "Tamil Nadu" },
    "Thanjavur": { lat: 10.8, lon: 79.1, state: "Tamil Nadu" },
    "Salem": { lat: 11.7, lon: 78.1, state: "Tamil Nadu" },
    // Bihar
    "Patna": { lat: 25.6, lon: 85.1, state: "Bihar" },
    "Muzaffarpur": { lat: 26.1, lon: 85.4, state: "Bihar" },
    "Gaya": { lat: 24.8, lon: 85.0, state: "Bihar" },
    // West Bengal
    "Kolkata": { lat: 22.6, lon: 88.4, state: "West Bengal" },
    "Siliguri": { lat: 26.7, lon: 88.4, state: "West Bengal" },
    "Asansol": { lat: 23.7, lon: 87.0, state: "West Bengal" },
    // Gujarat
    "Ahmedabad": { lat: 23.0, lon: 72.6, state: "Gujarat" },
    "Surat": { lat: 21.2, lon: 72.8, state: "Gujarat" },
    "Vadodara": { lat: 22.3, lon: 73.2, state: "Gujarat" },
    "Rajkot": { lat: 22.3, lon: 70.8, state: "Gujarat" },
    // Haryana
    "Gurugram": { lat: 28.5, lon: 77.0, state: "Haryana" },
    "Hisar": { lat: 29.2, lon: 75.7, state: "Haryana" },
    "Ambala": { lat: 30.4, lon: 76.8, state: "Haryana" },
    // Odisha
    "Bhubaneswar": { lat: 20.3, lon: 85.8, state: "Odisha" },
    "Cuttack": { lat: 20.5, lon: 85.9, state: "Odisha" },
    // Delhi
    "New Delhi": { lat: 28.6, lon: 77.2, state: "Delhi" },
};

export const DISTRICT_NAMES = Object.keys(DISTRICT_COORDS).sort();

/* ── Types ───────────────────────────────────────────────────────────── */
export interface CurrentWeather {
    temp: number;   // °C
    humidity: number;   // %
    rainfall: number;   // mm (last hour)
    wind: number;   // km/h
    uvIndex: number;
    feelsLike: number;  // °C
    condition: string;
    icon: string;
    updatedAt: string;
}

export interface DailyForecast {
    day: string;
    date: string;
    tempMax: number;
    tempMin: number;
    rain: number;   // mm
    humidity: number;   // %
    uvMax: number;
    icon: string;
    condition: string;
}

export interface LiveWeatherData {
    district: string;
    state: string;
    lat: number;
    lon: number;
    current: CurrentWeather;
    forecast: DailyForecast[];
    ndvi: number;    // computed estimate
    ndviLabel: string;
    status: "loading" | "live" | "error";
    error?: string;
    lastFetch: number;    // epoch ms
}

/* ── WMO weather code → label + emoji ─────────────────────────────── */
const WMO_CODE = (code: number): { label: string; icon: string } => {
    if (code === 0) return { label: "Clear Sky", icon: "☀️" };
    if (code <= 2) return { label: "Partly Cloudy", icon: "⛅" };
    if (code === 3) return { label: "Overcast", icon: "☁️" };
    if (code <= 49) return { label: "Foggy", icon: "🌫️" };
    if (code <= 59) return { label: "Drizzle", icon: "🌦" };
    if (code <= 67) return { label: "Rainy", icon: "🌧" };
    if (code <= 77) return { label: "Snowy", icon: "❄️" };
    if (code <= 82) return { label: "Showers", icon: "🌦" };
    if (code <= 86) return { label: "Heavy Snow", icon: "🌨" };
    if (code <= 99) return { label: "Thunderstorm", icon: "⛈" };
    return { label: "Unknown", icon: "🌡" };
};

/* ── Seasonal NDVI estimator ────────────────────────────────────────── */
const estimateNDVI = (
    rainfall: number,
    humidity: number,
    temp: number,
    month: number   // 1-12
): number => {
    // Kharif peak (Jun–Sep): higher NDVI
    const seasonFactor = [0.3, 0.3, 0.4, 0.5, 0.55, 0.7, 0.85, 0.82, 0.7, 0.55, 0.4, 0.3][month - 1];
    const rainFactor = Math.min(1, rainfall / 12);       // 12mm/hr = full rain factor
    const humFactor = humidity / 100;
    const tempFactor = temp > 10 && temp < 40 ? 1 - Math.abs(temp - 27) / 40 : 0.4;
    const raw = seasonFactor * 0.5 + rainFactor * 0.15 + humFactor * 0.2 + tempFactor * 0.15;
    return parseFloat(Math.max(0.05, Math.min(0.95, raw)).toFixed(3));
};

/* ── Main hook ───────────────────────────────────────────────────────── */
export const useLiveWeather = (initialDistrict = "Hyderabad", initialCoords?: {lat: number, lon: number, state: string}) => {
    const [district, setDistrictState] = useState(initialDistrict);
    const [coordsState, setCoordsState] = useState(initialCoords);
    
    const [data, setData] = useState<LiveWeatherData>({
        district,
        state: coordsState?.state || DISTRICT_COORDS[district]?.state || "",
        lat: coordsState?.lat || DISTRICT_COORDS[district]?.lat || 17.4,
        lon: coordsState?.lon || DISTRICT_COORDS[district]?.lon || 78.5,
        current: { temp: 0, humidity: 0, rainfall: 0, wind: 0, uvIndex: 0, feelsLike: 0, condition: "Loading…", icon: "🌡", updatedAt: "" },
        forecast: [],
        ndvi: 0.5,
        ndviLabel: "Moderate",
        status: "loading",
        lastFetch: 0,
    });

    const fetchWeather = useCallback(async (d: string, extraCoords?: {lat: number, lon: number, state: string}) => {
        const coords = extraCoords || DISTRICT_COORDS[d];
        if (!coords) return;

        setData(prev => ({ ...prev, status: "loading", district: d, state: coords.state || "" }));

        try {
            const url =
                `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${coords.lat}&longitude=${coords.lon}` +
                `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,` +
                `wind_speed_10m,weather_code,uv_index` +
                `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_max,` +
                `weather_code,uv_index_max` +
                `&timezone=Asia%2FKolkata` +
                `&forecast_days=7`;

            const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            /* ── Current ─────────────────────────────────────────────── */
            const cur = json.current;
            const wmo = WMO_CODE(cur.weather_code ?? 0);
            const current: CurrentWeather = {
                temp: Math.round(cur.temperature_2m ?? 0),
                humidity: Math.round(cur.relative_humidity_2m ?? 0),
                rainfall: parseFloat((cur.precipitation ?? 0).toFixed(1)),
                wind: Math.round(cur.wind_speed_10m ?? 0),
                uvIndex: Math.round(cur.uv_index ?? 0),
                feelsLike: Math.round(cur.apparent_temperature ?? 0),
                condition: wmo.label,
                icon: wmo.icon,
                updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            };

            /* ── 7-day forecast ──────────────────────────────────────── */
            const daily = json.daily;
            const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const forecast: DailyForecast[] = (daily.time as string[]).map((dateStr, i) => {
                const d2 = new Date(dateStr);
                const wmo2 = WMO_CODE(daily.weather_code[i] ?? 0);
                return {
                    day: i === 0 ? "Today" : DAY_NAMES[d2.getDay()],
                    date: dateStr,
                    tempMax: Math.round(daily.temperature_2m_max[i] ?? 0),
                    tempMin: Math.round(daily.temperature_2m_min[i] ?? 0),
                    rain: parseFloat((daily.precipitation_sum[i] ?? 0).toFixed(1)),
                    humidity: Math.round(daily.relative_humidity_2m_max[i] ?? 0),
                    uvMax: Math.round(daily.uv_index_max[i] ?? 0),
                    icon: wmo2.icon,
                    condition: wmo2.label,
                };
            });

            /* ── Computed NDVI ───────────────────────────────────────── */
            const month = new Date().getMonth() + 1;
            const weekRain = forecast.reduce((s, f) => s + f.rain, 0);
            const avgHumidity = forecast.reduce((s, f) => s + f.humidity, 0) / Math.max(forecast.length, 1);
            const ndvi = estimateNDVI(weekRain, avgHumidity, current.temp, month);
            const ndviLabel = ndvi > 0.6 ? "Healthy" : ndvi >= 0.3 ? "Moderate" : "Poor";

            setData({
                district: d, state: coords.state || "", lat: coords.lat, lon: coords.lon,
                current, forecast, ndvi, ndviLabel,
                status: "live", lastFetch: Date.now(),
            });

        } catch (err) {
            console.error("Open-Meteo fetch failed:", err);
            setData(prev => ({
                ...prev,
                status: "error",
                error: "Could not fetch live data. Check internet connection.",
            }));
        }
    }, []);

    /* Initial fetch + refresh every 10 minutes */
    useEffect(() => {
        fetchWeather(district, coordsState);
        const timer = setInterval(() => fetchWeather(district, coordsState), 10 * 60 * 1000);
        return () => clearInterval(timer);
    }, [district, coordsState, fetchWeather]);

    const setDistrict = (d: string) => {
        setDistrictState(d);
        setCoordsState(undefined); // Reset custom coords
        fetchWeather(d);
    };
    
    // Auto-update if initialDistrict/initialCoords change (e.g. from location load)
    useEffect(() => {
       if (initialCoords && initialCoords.lat !== data.lat) {
          setDistrictState(initialDistrict);
          setCoordsState(initialCoords);
          fetchWeather(initialDistrict, initialCoords);
       }
    }, [initialDistrict, initialCoords]);

    return { data, setDistrict, refresh: () => fetchWeather(district, coordsState) };
};
