import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { CHENNAI_CENTER, RouteOption, BusStop } from "@/data/mockData";
import { fetchHeatmap, toLeafletHeatLayer, fetchLocationSafety } from "@/api/safeherApi";


interface MapViewProps {
  routes: RouteOption[];
  selectedRoute: number | null;
  showBusStops: boolean;
  showHeatmap: boolean;
  onMapClick: (lat: number, lng: number) => void;
  busStopsData?: BusStop[];
}


// Fix Leaflet marker icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});


function busStopIcon(score: number) {
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f97316" : "#ef4444";
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:10px;color:white;font-weight:bold;">🚌</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}


export default function MapView({
  routes,
  selectedRoute,
  showBusStops,
  showHeatmap,
  onMapClick,
  busStopsData = [],
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.Polyline[]>([]);
  const heatRef = useRef<L.Layer | null>(null);


  // 1. INITIALIZE MAP (Runs once)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;


    const map = L.map(containerRef.current, {
      zoomControl: false
    }).setView(CHENNAI_CENTER, 13);


    L.control.zoom({ position: "bottomright" }).addTo(map);


    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);


    mapRef.current = map;


    // Map Click Logic
    map.on("click", async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);


      const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent(`<div style="font-family:sans-serif">Loading safety score...</div>`)
        .openOn(map);


      try {
        const safety = await fetchLocationSafety(lat, lng);
        const scoreColor = safety.safety_score >= 75 ? "#22c55e" : safety.safety_score >= 50 ? "#f97316" : "#ef4444";


        popup.setContent(`
          <div style="font-family:sans-serif;min-width:160px">
            <b>Safety Score:</b> <span style="color:${scoreColor};font-weight:bold">${safety.safety_score}%</span><br/>
            <small style="color:#666">${safety.label}</small>
          </div>
        `);
      } catch {
        popup.setContent(`<div style="font-family:sans-serif">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>`);
      }
    });


    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);


  // 2. ROUTES RENDERER (With crash protection)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;


    // Clear previous route polylines
    layersRef.current.forEach(l => map.removeLayer(l));
    layersRef.current = [];


    if (!routes || !Array.isArray(routes) || routes.length === 0) return;


    const validGlobalPoints: L.LatLngExpression[] = [];


    routes.forEach(r => {
      if (!r?.path || !Array.isArray(r.path)) return;


      // Ensure points are valid arrays of [number, number]
      const validPath = r.path.filter(p =>
        Array.isArray(p) && p.length === 2 && typeof p[0] === 'number'
      ) as L.LatLngExpression[];


      if (validPath.length < 2) return;


      const polyline = L.polyline(validPath, {
        color: r.color || "#3b82f6",
        weight: r.id === selectedRoute ? 7 : 4,
        opacity: r.id === selectedRoute ? 1 : 0.6,
        lineJoin: 'round'
      }).addTo(map);


      // Force route to top layer
      polyline.bringToFront();
      layersRef.current.push(polyline);
     
      validPath.forEach(p => validGlobalPoints.push(p));
    });


    // Fit map to routes safely
    if (validGlobalPoints.length > 0) {
      try {
        const bounds = L.latLngBounds(validGlobalPoints);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      } catch (err) {
        console.warn("Invalid bounds for current routes:", err);
      }
    }
  }, [routes, selectedRoute]);


  // 3. BUS STOPS
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;


    const markers: L.Layer[] = [];


    if (showBusStops && busStopsData.length > 0) {
      busStopsData.forEach(s => {
        const marker = L.marker([s.latitude, s.longitude], {
          icon: busStopIcon(s.safety_score),
        })
          .bindTooltip(`${s.name} — Safety: ${s.safety_score}%`)
          .addTo(map);
        markers.push(marker);
      });
    }


    return () => markers.forEach(m => map.removeLayer(m));
  }, [showBusStops, busStopsData]);


  // 4. HEATMAP (Layers routes on top after API response)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;


    if (heatRef.current) {
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }


    if (showHeatmap) {
      fetchHeatmap()
        .then(points => {
          const leafletPoints = toLeafletHeatLayer(points);
          const heat = (L as any).heatLayer(leafletPoints, {
            radius: 35,
            blur: 30,
            maxZoom: 17,
            minOpacity: 0.4,
            gradient: { 0.3: "#3b82f6", 0.6: "#22c55e", 1.0: "#fde047" },
          });


          heat.addTo(map);
          heatRef.current = heat;


          // Crucial: After heatmap is added, move routes back to front
          setTimeout(() => {
            layersRef.current.forEach(l => l.bringToFront());
          }, 100);
        })
        .catch(err => console.error("Error loading heatmap:", err));
    }
  }, [showHeatmap]);


  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-slate-200" />


      {/* Map Legend */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs border border-slate-200 z-[1000] pointer-events-none">
        <h4 className="font-bold mb-2 text-slate-700">Safety Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#3b82f6]" /> Very Safe
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" /> Safe
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fde047]" /> Moderate
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <span>🚌</span> Bus Stop
          </div>
        </div>
      </div>
    </div>
  );
}