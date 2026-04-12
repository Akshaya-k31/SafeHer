import { BusStop } from "@/data/mockData";
import { Bus, Lightbulb, Users, Shield } from "lucide-react";

interface BusStopPanelProps {
  stops: BusStop[];
  visible: boolean;
}

export default function BusStopPanel({ stops, visible }: BusStopPanelProps) {
  if (!visible || stops.length === 0) return null;

  const top5 = [...stops].sort((a, b) => b.safety_score - a.safety_score).slice(0, 5);

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
        <Bus className="h-4 w-4 text-primary" /> Top 5 Safest Bus Stops Nearby
      </h3>
      {top5.map(s => (
        <div key={s.id} className="p-3 rounded-xl border border-border bg-card text-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-foreground">{s.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              s.safety_score >= 75 ? "bg-safe text-safe-foreground" :
              s.safety_score >= 50 ? "bg-moderate text-moderate-foreground" :
              "bg-risky text-risky-foreground"
            }`}>
              {s.safety_score}%
            </span>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lightbulb className="h-3 w-3" /> {(s.lighting_score * 100).toFixed(0)}%</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(s.crowd_density * 100).toFixed(0)}%</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {s.safety_score}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
