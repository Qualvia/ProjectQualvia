import React, { useState } from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardBloque({ title, icon: Icon, children, dragHandleProps }) {
  const [abierto, setAbierto] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ background: "#EDE6DA" }}>
        {/* Drag handle */}
        <div
          {...dragHandleProps}
          className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Icon + Title */}
        <div className="flex items-center gap-2.5 flex-1">
          {Icon && <Icon className="w-5 h-5 text-[#0A3E47] shrink-0" />}
          <h2 className="text-lg font-semibold text-[#0A3E47]">{title}</h2>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setAbierto(!abierto)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ChevronDown
            className={cn("w-5 h-5 transition-transform duration-200", abierto ? "rotate-0" : "-rotate-90")}
          />
        </button>
      </div>

      {/* Content — siempre montado para que los callbacks sigan funcionando */}
      <div className={cn("border-t border-border", !abierto && "hidden")}>
        {children}
      </div>
    </div>
  );
}