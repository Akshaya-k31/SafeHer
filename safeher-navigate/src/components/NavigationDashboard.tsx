import { useState, useCallback, useEffect } from "react";
import { Search, MapPin, Menu, Home, Navigation, AlertTriangle, Info, Layers, Bus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MapView from "@/components/MapView";
import RoutePanel from "@/components/RoutePanel";
import BusStopPanel from "@/components/BusStopPanel";
import ReportModal from "@/components/ReportModal";
import { RouteOption, BusStop, CHENNAI_CENTER } from "@/data/mockData";
import { fetchRoutes, fetchBusStops } from "@/api/safeherApi";
import { useToast } from "@/hooks/use-toast";

// Pre-defined Chennai locations for autocomplete
const LOCATIONS: Record<string, [number, number]> = {
  "T. Nagar": [13.0418, 80.2341],
  "Anna Nagar": [13.0850, 80.2101],
  "Adyar": [13.0063, 80.2574],
  "Egmore": [13.0732, 80.2609],
  "Guindy": [13.0067, 80.2206],
  "Tambaram": [12.9249, 80.1000],
  "Velachery": [12.9815, 80.2180],
  "Koyambedu": [13.0694, 80.1948],
  "Mylapore": [13.0339, 80.2676],
  "Nungambakkam": [13.0569, 80.2425],
  "Chromepet": [12.9516, 80.1462],
  "Porur": [13.0382, 80.1564],
  "Thiruvanmiyur": [12.9830, 80.2594],
  "Broadway": [13.0900, 80.2800],
  "Saidapet": [13.0212, 80.2235],
};

interface NavigationDashboardProps {
  onGoHome: () => void;
}

export default function NavigationDashboard({ onGoHome }: NavigationDashboardProps) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [showBusStops, setShowBusStops] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLocation, setReportLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();

  const filterLocations = (query: string) =>
    query.length > 0
      ? Object.keys(LOCATIONS).filter(l => l.toLowerCase().includes(query.toLowerCase()))
      : [];

  // Load bus stops from API when toggled on
  useEffect(() => {
    if (showBusStops && busStops.length === 0) {
      fetchBusStops(CHENNAI_CENTER[0], CHENNAI_CENTER[1], 50)
        .then(stops => setBusStops(stops))
        .catch(() => {
          // Fallback: keep empty, map will handle gracefully
        });
    }
  }, [showBusStops]);

  const findRoute = useCallback(async () => {
    const startCoords = LOCATIONS[source];
    const endCoords = LOCATIONS[destination];
    if (!startCoords || !endCoords) return;

    setLoading(true);
    try {
      const r = await fetchRoutes(startCoords[0], startCoords[1], endCoords[0], endCoords[1]);
      setRoutes(r);
      setSelectedRoute(r[0].id);
      setShowBusStops(true);
      // Load bus stops near destination
      const stops = await fetchBusStops(endCoords[0], endCoords[1], 50);
      setBusStops(stops);
    } catch (err) {
      toast({
        title: "Could not reach server",
        description: "Make sure the Flask backend is running on port 5000.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [source, destination, toast]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setReportLocation([lat, lng]);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Nav — unchanged */}
      <nav className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card shrink-0 z-20">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-extrabold text-lg text-primary">Safe<span className="text-accent">Her</span></span>
        <div className="hidden md:flex items-center gap-1 ml-6">
          {[
            { icon: Home, label: "Home", onClick: onGoHome },
            { icon: Navigation, label: "Safe Navigation", onClick: () => {} },
            { icon: AlertTriangle, label: "Report Unsafe Area", onClick: () => setReportOpen(true) },
            { icon: Info, label: "About", onClick: onGoHome },
          ].map(item => (
            <Button key={item.label} variant="ghost" size="sm" onClick={item.onClick} className="text-muted-foreground hover:text-foreground text-xs gap-1.5">
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </Button>
          ))}
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — unchanged */}
        <aside className={`${sidebarOpen ? "w-80" : "w-0"} transition-all overflow-hidden border-r border-border bg-card shrink-0 flex flex-col`}>
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {/* Source */}
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Source</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-safe" />
                <Input
                  placeholder="e.g. T. Nagar"
                  value={source}
                  onChange={e => { setSource(e.target.value); setSourceSuggestions(filterLocations(e.target.value)); }}
                  className="pl-9"
                />
              </div>
              {sourceSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg">
                  {sourceSuggestions.map(s => (
                    <button key={s} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary text-foreground" onClick={() => { setSource(s); setSourceSuggestions([]); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
                <Input
                  placeholder="e.g. Adyar"
                  value={destination}
                  onChange={e => { setDestination(e.target.value); setDestSuggestions(filterLocations(e.target.value)); }}
                  className="pl-9"
                />
              </div>
              {destSuggestions.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-lg shadow-lg">
                  {destSuggestions.map(s => (
                    <button key={s} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary text-foreground" onClick={() => { setDestination(s); setDestSuggestions([]); }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={findRoute} disabled={!LOCATIONS[source] || !LOCATIONS[destination] || loading} className="w-full gradient-primary text-primary-foreground font-bold">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding Routes...</> : <><Search className="h-4 w-4 mr-2" /> Find Safe Route</>}
            </Button>

            <div className="flex gap-2">
              <Button variant={showBusStops ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setShowBusStops(!showBusStops)}>
                <Bus className="h-3.5 w-3.5 mr-1" /> Bus Stops
              </Button>
              <Button variant={showHeatmap ? "default" : "outline"} size="sm" className="flex-1 text-xs" onClick={() => setShowHeatmap(!showHeatmap)}>
                <Layers className="h-3.5 w-3.5 mr-1" /> Heatmap
              </Button>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground" onClick={() => setReportOpen(true)}>
              <AlertTriangle className="h-3.5 w-3.5 mr-1" /> Report Unsafe Location
            </Button>

            <RoutePanel routes={routes} selectedRoute={selectedRoute} onSelectRoute={setSelectedRoute} />
            <BusStopPanel stops={busStops} visible={showBusStops && busStops.length > 0} />
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative">
          <MapView
            routes={routes}
            selectedRoute={selectedRoute}
            showBusStops={showBusStops}
            showHeatmap={showHeatmap}
            onMapClick={handleMapClick}
            busStopsData={busStops}
          />
        </main>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} location={reportLocation} />
    </div>
  );
}
