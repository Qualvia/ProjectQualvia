import React from "react";
import { CheckSquare } from "lucide-react";

export default function Checklist() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Checklist</h1>
      </div>
      <p className="text-sm text-muted-foreground">Próximamente.</p>
    </div>
  );
}