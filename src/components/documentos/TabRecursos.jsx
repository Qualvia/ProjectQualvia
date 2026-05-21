import React from "react";
import { Library } from "lucide-react";

export default function TabRecursos() {
  return (
    <div className="bg-white rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <Library className="w-7 h-7 text-[#0A3E47]" />
      </div>
      <p className="font-bold text-[#0A3E47] text-lg">Recursos — Próximamente</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Aquí encontrarás plantillas, guías y recursos útiles para la gestión de la seguridad alimentaria.
      </p>
    </div>
  );
}