import React from "react";
import { Bot } from "lucide-react";

export default function Asistente() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Asistente</h1>
      </div>
      <p className="text-sm text-muted-foreground">Próximamente.</p>
    </div>
  );
}