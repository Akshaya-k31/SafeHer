import { RouteOption } from "@/data/mockData";
import { Shield, Clock, MapPin } from "lucide-react";

interface RoutePanelProps {
  routes: RouteOption[];
  selectedRoute: number | null;
  onSelectRoute: (id: number) => void;
}

function getScoreBadge(score: number) {
  if (score >= 75) return { className: "bg-safe text-safe-foreground", label: "Safe" };
  if (score >= 50) return { className: "bg-moderate text-moderate-foreground", label: "Moderate" };
  return { className: "bg-risky text-risky-foreground", label: "Risky" };
}

export default function RoutePanel({ routes, selectedRoute, onSelectRoute }: RoutePanelProps) {
  if (routes.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-foreground text-sm">Route Options</h3>
      {routes.map(r => {
        const badge = getScoreBadge(r.safetyScore);
        const active = selectedRoute === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelectRoute(r.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              active ? "border-primary shadow-md bg-secondary/60" : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                {r.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badge.className}`}>
                {badge.label}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {r.safetyScore}%</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.distance}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {r.duration}</span>
            </div>
          </button>
        );
      })}
      {/* Legend */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Route Legend</p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-safe" /> Safest</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-moderate" /> Balanced</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-risky" /> Fastest</span>
        </div>
      </div>
    </div>
  );
}
