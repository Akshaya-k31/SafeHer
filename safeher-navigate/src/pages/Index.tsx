import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import NavigationDashboard from "@/components/NavigationDashboard";

const Index = () => {
  const [view, setView] = useState<"landing" | "dashboard">("landing");

  if (view === "dashboard") {
    return <NavigationDashboard onGoHome={() => setView("landing")} />;
  }

  return <LandingPage onNavigate={() => setView("dashboard")} />;
};

export default Index;
