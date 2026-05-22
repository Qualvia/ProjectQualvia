import React from "react";
import { ClipboardList } from "lucide-react";

export default function TabAuditorias() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <ClipboardList className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-lg font-semibold text-foreground">Auditorías</p>
      <p className="text-sm text-muted-foreground max-w-xs">Esta sección estará disponible próximamente. Aquí podrás realizar auditorías completas de tu negocio.</p>
    </div>
  );
}