import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const { currentBusiness } = useBusiness();

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <p className="text-muted-foreground text-sm">
        {currentBusiness?.name}
      </p>
    </div>
  );
}