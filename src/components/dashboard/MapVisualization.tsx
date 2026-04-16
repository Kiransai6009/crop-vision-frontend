import "leaflet/dist/leaflet.css";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polygon, GeoJSON, Marker } from "react-leaflet";
import { MapPin, Activity, Droplets, LocateFixed, Map as MapIcon, ChevronRight } from "lucide-react";
import L from "leaflet";

import { DISTRICT_COORDS } from "@/hooks/useLiveWeather";
import { useGlobalLocation } from "@/context/LocationContext";
import { apDistrictsGeoJSON } from "@/data/ap_districts";

// Fix Leaflet marker icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  district: string;
  state: string;
}

const RecenterMap = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { animate: true, duration: 2 });
  }, [lat, lon, map]);
  return null;
};

// Generate deterministic random offsets to simulate farm nodes relative to center
const generateNodes = (lat: number, lon: number) => {
  return Array.from({ length: 5 }).map((_, i) => {
    const offsetLat = (Math.sin(lat * 100 + i) * 0.15) - 0.075;
    const offsetLon = (Math.cos(lon * 100 + i) * 0.15) - 0.075;
    const health = Math.random();
    return {
      id: `node-${i}`,
      lat: lat + offsetLat,
      lon: lon + offsetLon,
      ndvi: 0.3 + (health * 0.5),
      moisture: 40 + (health * 50),
      status: health > 0.6 ? "Healthy" : health > 0.3 ? "Moderate" : "Stress"
    };
  });
};

export const MapVisualization = ({ district, state }: MapProps) => {
  const { 
    lat: userLat, 
    lon: userLon, 
    city, 
    mode, 
    setMode, 
    selectedDistrict, 
    setSelectedDistrict,
    locationName 
  } = useGlobalLocation();
  
  const [coords, setCoords] = useState<[number, number]>([15.9129, 79.74]); // AP Center default

  useEffect(() => {
    if (mode === "current" && userLat && userLon) {
      setCoords([userLat, userLon]);
    } else if (mode === "district" && selectedDistrict) {
      const lookup = DISTRICT_COORDS[selectedDistrict];
      if (lookup) {
        setCoords([lookup.lat, lookup.lon]);
      } else {
        // Fallback to AP center if district coords not found
        setCoords([15.9129, 79.74]);
      }
    } else {
      // General fallback
      setCoords([15.9129, 79.74]);
    }
  }, [mode, selectedDistrict, userLat, userLon]);

  // Compute nodes and farm boundaries when coords change
  const { nodes, boundingBox } = useMemo(() => {
    const freshNodes = generateNodes(coords[0], coords[1]);
    const dLat = 0.2;
    const dLon = 0.25;
    const boundingBox: [number, number][] = [
      [coords[0] - dLat, coords[1] - dLon],
      [coords[0] + dLat, coords[1] - dLon],
      [coords[0] + dLat + 0.1, coords[1] + dLon - 0.1],
      [coords[0] - dLat + 0.05, coords[1] + dLon]
    ];
    return { nodes: freshNodes, boundingBox };
  }, [coords[0], coords[1]]);

  return (
    <div className="p-6 rounded-4xl bg-card/20 border border-border/10 shadow-3xl relative overflow-hidden h-[500px]">
      <div className="absolute top-6 left-6 z-[400] bg-background/80 backdrop-blur-xl px-5 py-3 rounded-2xl border border-border/20 flex flex-col gap-1 shadow-2xl">
        <div className="flex items-center gap-2">
           <MapPin className="w-5 h-5 text-green-500" />
           <span className="font-display font-black text-foreground text-lg tracking-tighter">GeoVisualization</span>
        </div>
        <p className="text-xs font-black text-muted-foreground/60 tracking-widest uppercase ml-7">
          {mode === "current" ? `Active ROI: ${city}` : `District Intel: ${selectedDistrict || "Andhra Pradesh"}`}
        </p>
      </div>

      <div className="w-full h-full rounded-3xl overflow-hidden mt-2 relative z-10 border border-border/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
        <MapContainer 
          center={coords} 
          zoom={9} 
          style={{ height: '100%', width: '100%', zIndex: 10, background: '#090a0f' }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Dark theme premium map tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          />
          
          <RecenterMap lat={coords[0]} lon={coords[1]} />
          
          {mode === "current" && userLat && userLon && (
             <Marker position={[userLat, userLon]}>
                <Popup>
                   <div className="font-bold">You are here</div>
                   <div className="text-xs text-muted-foreground">{locationName}</div>
                </Popup>
             </Marker>
          )}

          {mode === "district" && (
            <GeoJSON 
              data={apDistrictsGeoJSON as any} 
              style={(feature) => ({
                color: selectedDistrict === feature?.properties.district ? "#22C55E" : "#4B5563",
                weight: selectedDistrict === feature?.properties.district ? 3 : 1,
                fillColor: selectedDistrict === feature?.properties.district ? "#22C55E" : "#1F2937",
                fillOpacity: selectedDistrict === feature?.properties.district ? 0.3 : 0.1,
              })}
              onEachFeature={(feature, layer) => {
                layer.on({
                  click: () => {
                    const dName = feature.properties.district;
                    alert("Selected District: " + dName);
                    setSelectedDistrict(dName);
                  },
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({ fillOpacity: 0.5 });
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    if (feature.properties.district !== selectedDistrict) {
                      l.setStyle({ fillOpacity: 0.1 });
                    } else {
                      l.setStyle({ fillOpacity: 0.3 });
                    }
                  }
                });
              }}
            />
          )}
          
          {mode === "current" && <Polygon positions={boundingBox} pathOptions={{ color: '#22C55E', weight: 2, dashArray: '5, 10', fillColor: '#22C55E', fillOpacity: 0.05 }} />}

          {/* Main Focus Ring */}
          {mode === "current" && (
            <CircleMarker
              center={coords}
              pathOptions={{ color: 'rgba(34,197,94,0.3)', fillColor: 'none', weight: 1 }}
              radius={80}
            />
          )}

          {mode === "current" && nodes.map(node => (
             <CircleMarker
               key={node.id}
               center={[node.lat, node.lon]}
               pathOptions={{ 
                 color: node.status === 'Healthy' ? '#22C55E' : node.status === 'Moderate' ? '#F59E0B' : '#EF4444', 
                 fillColor: node.status === 'Healthy' ? '#22C55E' : node.status === 'Moderate' ? '#F59E0B' : '#EF4444', 
                 fillOpacity: 0.8,
                 weight: 4
               }}
               radius={6}
             >
               <Popup className="premium-map-popup">
                 <div className="p-3 bg-background border border-border/20 rounded-xl shadow-2xl flex flex-col gap-2 min-w-[200px] -m-2">
                   <div className="flex items-center justify-between border-b border-border/10 pb-2">
                     <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Node {node.id.split('-')[1]}</span>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        node.status === 'Healthy' ? 'bg-green-500/10 text-green-500' : 
                        node.status === 'Moderate' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                     }`}>
                       {node.status}
                     </span>
                   </div>
                   <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-blue-400" /><span className="text-xs font-bold">NDVI</span></div>
                      <span className="text-xs font-black">{node.ndvi.toFixed(2)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5"><Droplets className="w-3 h-3 text-blue-400" /><span className="text-xs font-bold">Moisture</span></div>
                      <span className="text-xs font-black">{node.moisture.toFixed(0)}%</span>
                   </div>
                 </div>
               </Popup>
             </CircleMarker>
          ))}
        </MapContainer>
        
        {/* Mode Toggle Controls */}
        <div className="absolute top-6 right-6 z-[400] flex gap-2">
          <button 
            onClick={() => setMode("current")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 shadow-xl ${
              mode === "current" 
                ? "bg-green-500 border-green-400 text-white font-black" 
                : "bg-background/80 backdrop-blur-xl border-border/20 text-muted-foreground hover:bg-background"
            }`}
          >
            <LocateFixed className="w-4 h-4" />
            <span className="text-xs">My Location</span>
          </button>
          <button 
            onClick={() => setMode("district")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 shadow-xl ${
              mode === "district" 
                ? "bg-green-500 border-green-400 text-white font-black" 
                : "bg-background/80 backdrop-blur-xl border-border/20 text-muted-foreground hover:bg-background"
            }`}
          >
            <MapIcon className="w-4 h-4" />
            <span className="text-xs">AP Districts</span>
          </button>
        </div>

        {/* Analytics Overlays */}
        <div className="absolute bottom-6 right-6 z-[400] flex flex-col gap-3 pointer-events-none">
          <div className="flex flex-col gap-1 bg-background/90 backdrop-blur-md border border-border/20 p-4 rounded-2xl shadow-2xl min-w-[180px]">
             <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/80">
                  {mode === "current" ? "Sensor Grid" : "District Intel"}
                </span>
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
             </div>
             {mode === "current" ? (
               <>
                 <div className="flex items-center justify-between gap-6">
                    <span className="text-xs font-bold text-foreground">Active Nodes</span>
                    <span className="text-sm font-black text-green-500">5 / 5</span>
                 </div>
                 <div className="flex items-center justify-between gap-6">
                    <span className="text-xs font-bold text-foreground">Coverage Area</span>
                    <span className="text-sm font-black text-foreground">14.2 km²</span>
                 </div>
               </>
             ) : (
               <>
                 <div className="flex items-center justify-between gap-6">
                    <span className="text-xs font-bold text-foreground">Selected</span>
                    <span className="text-sm font-black text-green-500">{selectedDistrict || "None"}</span>
                 </div>
                 <div className="flex items-center justify-between gap-6">
                    <span className="text-xs font-bold text-foreground">Stat</span>
                    <span className="text-sm font-black text-foreground">{selectedDistrict ? "85% Yield" : "-"}</span>
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
