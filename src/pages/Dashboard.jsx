import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { AlertTriangle, CheckCircle2, Flame, Sparkles, Lightbulb, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function today() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} De ${MONTHS[d.getMonth()]}`;
}



const CONSEJO = "Establece un sistema de codificación para los ingredientes y productos en tu cocina, asignando un lote y fecha de ingreso a cada uno. Esto facilitará la gestión de inventario y asegurará el seguimiento en caso de cualquier incidencia, mejorando la trazabilidad de los alimentos.";

export default function Dashboard() {
  const { user } = useBusiness();
  const nombre = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "usuario";

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3E47]">Hola, {nombre} 👋</h1>
          <p className="text-sm text-[#6BB68A] font-medium mt-0.5">Sigamos cuidando la calidad juntos.</p>
          <p className="text-xs text-muted-foreground mt-0.5">{today()}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2">
            <Sparkles className="w-4 h-4" />
            Preguntar a QUALVIA
          </Button>
          <Button className="bg-[#0A3E47] hover:bg-[#0a3340] text-white gap-2">
            <Lightbulb className="w-4 h-4" />
            Recomendaciones
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* KPI 1 — Incidencias activas */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Incidencias activas</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground leading-none">—</span>
          </div>
          <div className="mt-auto pt-2 border-t border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-xs text-muted-foreground">Abiertas o en seguimiento</span>
          </div>
        </div>

        {/* KPI 2 — Tareas completadas hoy */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Tareas completadas hoy</span>
            <div className="w-9 h-9 rounded-xl bg-[#6BB68A]/10 flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5 text-[#6BB68A]" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground leading-none">—</span>
            <span className="text-lg text-muted-foreground font-medium mb-1">/ —</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#6BB68A] w-0 transition-all duration-500" />
          </div>
          <div className="mt-auto pt-2 border-t border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6BB68A] shrink-0" />
            <span className="text-xs text-muted-foreground">Tareas completadas hoy</span>
          </div>
        </div>

        {/* KPI 3 — Racha de días consecutivos */}
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">Racha de días</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <Flame className="w-4.5 h-4.5 text-orange-400" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold text-foreground leading-none">—</span>
            <span className="text-lg text-muted-foreground font-medium mb-1">días</span>
          </div>
          <div className="mt-auto pt-2 border-t border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            <span className="text-xs text-muted-foreground">Días consecutivos ≥80% tareas</span>
          </div>
        </div>

      </div>

      {/* Consejo QUALVIA */}
      <div className="bg-gradient-to-r from-[#0A3E47] to-[#6BB68A] rounded-2xl p-5 flex gap-4 items-start">
        <div className="bg-white/20 rounded-xl p-2.5 shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Consejo QUALVIA del día</p>
          <p className="text-sm text-white/85 leading-relaxed">{CONSEJO}</p>
        </div>
      </div>
    </div>
  );
}