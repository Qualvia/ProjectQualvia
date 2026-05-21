import React from "react";
import { BarChart2 } from "lucide-react";

export default function TabInformes() {
  return (
    <div className="bg-white rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <BarChart2 className="w-7 h-7 text-[#0A3E47]" />
      </div>
      <p className="font-bold text-[#0A3E47] text-lg">Informes — Próximamente</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Aquí podrás generar informes periódicos de tus registros y controles de seguridad alimentaria.
      </p>
    </div>
  );
}