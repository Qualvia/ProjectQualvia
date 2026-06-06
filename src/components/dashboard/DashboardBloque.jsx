import React, { useState, useEffect } from "react";
import { ChevronDown, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardBloque({ id, businessId, title, icon: Icon, children, dragHandleProps, defaultOpen = true }) {
  const [abierto, setAbierto] = useState(() => {
    if (!id || !businessId) return defaultOpen;
    const guardado = localStorage.getItem(`qualvia_bloque_abierto_${businessId}_${id}`);
    return guardado !== null ? JSON.parse(guardado) : defaultOpen;
  });

  useEffect(() => {
    if (!id || !businessId) return;
    const guardado = localStorage.getItem(`qualvia_bloque_abierto_${businessId}_${id}`);
    setAbierto(guardado !== null ? JSON.parse(guardado) : defaultOpen);
  }, [id, businessId]);

  const handleToggle = () => {
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    if (id && businessId) {
      localStorage.setItem(`qualvia_bloque_abierto_${businessId}_${id}`, JSON.stringify(nuevoEstado));
    }
  };

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
          onClick={handleToggle}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ChevronDown
            className={cn("w-5 h-5 transition-transform duration-200", abierto ? "rotate-0" : "-rotate-90")}
          />
        </button>
      </div>

      {/* Content — lazy: solo se monta si está abierto */}
      {abierto && (
        <div className="border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}