import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const { currentBusiness } = useBusiness();

  return (
    <div className="p-6 md:p-10 space-y-2">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5 text-[#0A3E47]" />
        <h1 className="text-xl font-semibold text-[#1B1B1B]">Dashboard</h1>
      </div>
      <p className="text-sm text-muted-foreground">{currentBusiness?.name}</p>
    </div>
  );
}