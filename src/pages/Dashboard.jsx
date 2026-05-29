import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { AlertCircle, ClipboardCheck, Flame, Clock, TrendingUp, Sparkles, Lightbulb, Bot } from "lucide-react";
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
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3" style={{ borderLeft: "5px solid #A32D2D" }}>
          <span className="text-[14px] font-semibold" style={{ color: "#0A3E47" }}>Incidencias activas</span>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEE8E8" }}>
              <AlertCircle className="w-5 h-5" style={{ color: "#A32D2D" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium leading-none" style={{ fontSize: "32px", letterSpacing: "-0.02em", color: "#A32D2D" }}>1</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#A32D2D" }} />
                <span className="text-[10px]" style={{ color: "#A32D2D" }}>1 de prioridad crítica</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 2 — Tareas completadas hoy */}
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3" style={{ borderLeft: "5px solid #D97706" }}>
          <span className="text-[14px] font-semibold" style={{ color: "#0A3E47" }}>Tareas completadas hoy</span>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3DC" }}>
              <ClipboardCheck className="w-5 h-5" style={{ color: "#8A5C00" }} />
            </div>
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium leading-none" style={{ fontSize: "28px", letterSpacing: "-0.02em", color: "#8A5C00" }}>3 / 7</span>
              <div className="h-[3px] rounded-full my-1" style={{ background: "#DDD5C8" }}>
                <div className="h-full rounded-full" style={{ width: "43%", background: "#D97706" }} />
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-[10px] h-[10px] shrink-0" style={{ color: "#8A5C00" }} />
                <span className="text-[10px]" style={{ color: "#8A5C00" }}>4 pendientes esta tarde</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI 3 — Racha de días */}
        <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-3" style={{ borderLeft: "5px solid #2E7D52" }}>
          <span className="text-[14px] font-semibold" style={{ color: "#0A3E47" }}>Días consecutivos al día</span>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E4F2EC" }}>
              <Flame className="w-5 h-5" style={{ color: "#2E7D52" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-medium leading-none" style={{ fontSize: "32px", letterSpacing: "-0.02em", color: "#2E7D52" }}>14</span>
              <div className="flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-[10px] h-[10px] shrink-0" style={{ color: "#2E7D52" }} />
                <span className="text-[10px]" style={{ color: "#2E7D52" }}>Tu mejor racha este mes</span>
              </div>
            </div>
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