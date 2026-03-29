import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";

interface MapProps {
  district: string;
  state: string;
}

// Custom hook to re-center map when district/state changes
const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { animate: true, duration: 2 });
  }, [lat, lon, map]);
  return null;
};

export const MapVisualization = ({ district, state }: MapProps) => {
  // We mock the latitude and longitude based on input changes just for visualization
  const [coords, setCoords] = useState<[number, number]>([19.9975, 73.7898]); // default Nasik, MH

  useEffect(() => {
    // Simulated coordinate shift to make map interactive when user selects different districts
    setCoords([19.0 + Math.random() * 5, 73.0 + Math.random() * 5]);
  }, [district, state]);

  return (
    <div className="p-6 rounded-3xl glass-card border border-border/40 shadow-lg relative overflow-hidden h-[400px]">
      <div className="absolute top-6 left-6 z-[400] bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-border/50 flex items-center gap-2 shadow-lg">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Geo Visualization: {district}</span>
      </div>

      <div className="w-full h-full rounded-2xl overflow-hidden mt-2 relative z-10 border border-border/50">
        <MapContainer 
          center={coords} 
          zoom={8} 
          style={{ height: '100%', width: '100%', zIndex: 10 }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Dark theme tile layer from CartoDB */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          />
          
          <RecenterMap lat={coords[0]} lon={coords[1]} />
          
          <CircleMarker
            center={coords}
            pathOptions={{ color: 'hsl(188, 100%, 44%)', fillColor: 'hsl(188, 100%, 44%)', fillOpacity: 0.4 }}
            radius={40}
          />
        </MapContainer>
        
        {/* Overlays for styling */}
        <div className="absolute top-0 right-0 p-4 z-[400] flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur border border-border/50 px-3 py-1.5 rounded-full text-[10px] font-medium text-white/80">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Analyzing Area
          </div>
        </div>
      </div>
    </div>
  );
};
