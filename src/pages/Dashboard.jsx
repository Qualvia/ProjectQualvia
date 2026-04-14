import React from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Clock, AlertCircle, CheckCircle2, ClipboardList, Sparkles, Lightbulb, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

function today() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} De ${MONTHS[d.getMonth()]}`;
}

function CircleProgress({ percent }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width="96" height="96" viewBox="0 0 96 96">
      <circle cx="48" cy="48" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="48" cy="48" r={r} fill="none"
        stroke="#6BB68A" strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="53" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1B1B1B">
        {percent}%
      </text>
    </svg>
  );
}

const STATS = [
  {
    label: "TAREAS PENDIENTES",
    icon: Clock,
    iconColor: "text-orange-400",
    value: 2,
    sub: "pendientes",
    barColor: "bg-orange-400",
    barWidth: "w-2/3",
    tag: "REQUIEREN ACCIÓN",
  },
  {
    label: "INCIDENCIAS ACTIVAS",
    icon: AlertCircle,
    iconColor: "text-red-400",
    value: 1,
    sub: null,
    barColor: "bg-red-400",
    barWidth: "w-1/4",
    tag: "PRIORIDAD ALTA",
  },
  {
    label: "REGISTROS HOY",
    icon: ClipboardList,
    iconColor: "text-[#0A3E47]",
    value: 0,
    sub: null,
    barColor: "bg-gray-200",
    barWidth: "w-0",
    tag: "ÚLTIMAS 24H",
  },
];

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

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tareas, Incidencias, Registros */}
        {STATS.map(({ label, icon: Icon, iconColor, value, sub, barColor, barWidth, tag }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">{label}</span>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <span className="text-4xl font-bold text-foreground">{value}</span>
              {sub && <span className="text-sm text-muted-foreground ml-2">{sub}</span>}
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor} ${barWidth}`} />
            </div>
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">{tag}</span>
          </div>
        ))}

        {/* Cumplimiento con círculo */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">CUMPLIMIENTO</span>
            <CheckCircle2 className="w-5 h-5 text-[#6BB68A]" />
          </div>
          <div className="flex justify-center py-1">
            <CircleProgress percent={88} />
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