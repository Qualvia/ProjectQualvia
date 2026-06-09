import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Thermometer, Droplets, ShieldCheck, ClipboardList, Package, Trash2, Wrench, Snowflake, FlaskConical, ClipboardCheck, AlertTriangle, Activity, Bug } from "lucide-react";

const TIPO_CONFIG = {
  temperatura:   { icon: Thermometer,   bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  limpieza:      { icon: ShieldCheck,   bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  recepcion:     { icon: Package,       bg: "bg-[#FEF3DC]", color: "text-[#D97706]" },
  agua:          { icon: Droplets,      bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  residuos:      { icon: Trash2,        bg: "bg-[#FEE8E8]", color: "text-[#C0392B]" },
  mantenimiento: { icon: Wrench,        bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  congelacion:   { icon: Snowflake,     bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  alergenos:     { icon: FlaskConical,  bg: "bg-[#FEF3DC]", color: "text-[#D97706]" },
  plagas:        { icon: Bug,           bg: "bg-[#FEF3DC]", color: "text-[#D97706]" },
  checklist:     { icon: ClipboardCheck,bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  auditoria:     { icon: ClipboardList, bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  incidencia:    { icon: AlertTriangle, bg: "bg-[#FEE8E8]", color: "text-[#C0392B]" },
};

function EventoItem({ evento, isLast }) {
  const cfg = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.temperatura;
  const Icon = cfg.icon;
  const hora = evento.fecha
    ? `${String(new Date(evento.fecha).getHours()).padStart(2,"0")}:${String(new Date(evento.fecha).getMinutes()).padStart(2,"0")}`
    : "—";

  return (
    <div className={`flex items-start gap-3 py-3 ${!isLast ? "border-b border-border/50" : ""}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{evento.quien}</span>{" "}
          <span>{evento.accion}</span>
        </p>
        {evento.detalle && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{evento.detalle}</p>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">{hora}</span>
    </div>
  );
}

export default function ActividadRecienteBloque() {
  const { user, currentBusiness } = useBusiness();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodos, setVerTodos] = useState(false);

  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;

    const bid = currentBusiness.id;
    const uid = user.id;

    setLoading(true);
    setEventos([]);

    // Inicio y fin del día actual
    const hoyStr = new Date().toISOString().slice(0, 10);
    const inicioDia = new Date(hoyStr + "T00:00:00.000Z").toISOString();
    const finDia = new Date(hoyStr + "T23:59:59.999Z").toISOString();

    base44.entities.RegistroActividad.filter(
      { user_id: uid, business_id: bid, fecha: { $gte: inicioDia, $lte: finDia } },
      "-fecha",
      50
    ).then((data) => {
      setEventos(data);
      setLoading(false);
    });

    // Suscripción en tiempo real: aparece al instante cuando alguien registra algo hoy
    const unsubscribe = base44.entities.RegistroActividad.subscribe((event) => {
      if (event.type === "create"
        && event.data?.business_id === bid
        && event.data?.user_id === uid) {
        const fechaEvento = event.data?.fecha ? new Date(event.data.fecha).toISOString().slice(0, 10) : null;
        const hoyActual = new Date().toISOString().slice(0, 10);
        if (fechaEvento === hoyActual) {
          setEventos((prev) => [event.data, ...prev].slice(0, 50));
        }
      }
    });

    return () => unsubscribe();
  }, [user?.id, currentBusiness?.id]);

  if (loading) {
    return (
      <div className="px-5 py-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="px-5 py-10 flex flex-col items-center gap-2">
        <Activity className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Sin actividad registrada aún</p>
        <p className="text-xs text-muted-foreground/70">Los registros aparecerán aquí en tiempo real</p>
      </div>
    );
  }

  const visibles = verTodos ? eventos : eventos.slice(0, 8);

  return (
    <div className="px-5 py-2">
      <p className="text-[11px] text-muted-foreground py-2">
        {eventos.length} evento{eventos.length !== 1 ? "s" : ""} recientes
      </p>
      {visibles.map((ev, i) => (
        <EventoItem key={ev.id || i} evento={ev} isLast={i === visibles.length - 1 && (verTodos || eventos.length <= 8)} />
      ))}
      {eventos.length > 8 && (
        <button
          onClick={() => setVerTodos(!verTodos)}
          className="w-full text-xs font-medium text-[#6BB68A] border border-[#6BB68A]/40 rounded-lg py-2 mt-2 mb-1 hover:bg-[#6BB68A]/5 transition-colors">
          {verTodos ? "Ver menos ▲" : `Ver ${eventos.length - 8} más ▼`}
        </button>
      )}
    </div>
  );
}