import React, { useState, useEffect } from "react";
import { useDashboardData } from "@/contexts/DashboardDataContext";
import { Thermometer, Droplets, ShieldCheck, ClipboardList, Package, Trash2, Wrench, Snowflake, FlaskConical, ClipboardCheck, AlertTriangle, Activity } from "lucide-react";

function formatHora(fechaStr) {
  if (!fechaStr) return "—";
  const d = new Date(fechaStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const TIPO_CONFIG = {
  temperatura:  { icon: Thermometer,   bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  limpieza:     { icon: ShieldCheck,    bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  recepcion:    { icon: Package,        bg: "bg-[#FEF3DC]", color: "text-[#D97706]" },
  agua:         { icon: Droplets,       bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  residuos:     { icon: Trash2,         bg: "bg-[#FEE8E8]", color: "text-[#C0392B]" },
  mantenimiento:{ icon: Wrench,         bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  congelacion:  { icon: Snowflake,      bg: "bg-[#EDE6DA]", color: "text-[#0A3E47]" },
  alergenos:    { icon: FlaskConical,   bg: "bg-[#FEF3DC]", color: "text-[#D97706]" },
  checklist:    { icon: ClipboardCheck, bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  auditoria:    { icon: ClipboardList,  bg: "bg-[#E4F2EC]", color: "text-[#2E7D52]" },
  incidencia:   { icon: AlertTriangle,  bg: "bg-[#FEE8E8]", color: "text-[#C0392B]" },
};

function EventoItem({ evento, isLast }) {
  const cfg = TIPO_CONFIG[evento.tipo] || TIPO_CONFIG.temperatura;
  const Icon = cfg.icon;
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
      <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">{evento.hora}</span>
    </div>
  );
}

export default function ActividadRecienteBloque() {
  const { data, loading } = useDashboardData();
  const [eventos, setEventos] = useState([]);
  const [verTodos, setVerTodos] = useState(false);

  useEffect(() => {
    if (!data) return;
    construirEventos();
  }, [data]);

  function construirEventos() {
    const fechaInicio = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const filtrar = (arr, campo = "fecha") =>
      (arr || []).filter(r => new Date(r[campo] || r.fecha || r.created_date) >= fechaInicio);

    const temps         = filtrar(data.temperaturas);
    const limpiezas     = filtrar(data.limpiezas);
    const recepciones   = filtrar(data.recepciones);
    const aguas         = filtrar(data.aguas);
    const residuos      = filtrar(data.residuos);
    const mantenimientos = filtrar(data.mantenimientos);
    const congelaciones = filtrar(data.congelaciones);
    const alergenos     = (data.alergenos || []).filter(r => new Date(r.created_date || r.fecha) >= fechaInicio);
    const checklists    = filtrar(data.checklists);
    const auditorias    = filtrar(data.auditorias);
    const incidencias   = (data.incidencias || []).filter(r => new Date(r.created_date || r.fecha) >= fechaInicio);

    const lista = [];

    temps.forEach(r => {
      lista.push({
        tipo: "temperatura", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `registró temperatura · ${r.equipo_nombre || "equipo"}`,
        detalle: r.temperatura != null ? `${r.temperatura}°C` : null,
      });
    });

    limpiezas.forEach(r => {
      lista.push({
        tipo: "limpieza", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `registró limpieza · ${r.zona_nombre || "zona"}`,
        detalle: r.estado === "satisfactorio" ? "Satisfactorio" : r.estado === "no_limpiado" ? "No limpiado" : "No aplica",
      });
    });

    recepciones.forEach(r => {
      lista.push({
        tipo: "recepcion", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `control de recepción · ${r.producto || "producto"}`,
        detalle: `${r.proveedor || ""} · ${r.resultado === "aceptado" ? "Aceptado" : "Rechazado"}`,
      });
    });

    aguas.forEach(r => {
      lista.push({
        tipo: "agua", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `análisis de agua · ${r.punto_nombre || "punto"}`,
        detalle: r.cloro_nivel != null ? `Cloro: ${r.cloro_nivel} · pH: ${r.ph_nivel ?? "—"}` : null,
      });
    });

    residuos.forEach(r => {
      lista.push({
        tipo: "residuos", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `gestión de residuos · ${r.tipo_residuo || ""}`,
        detalle: r.cantidad != null ? `${r.cantidad} ${r.unidad || ""}` : null,
      });
    });

    mantenimientos.forEach(r => {
      lista.push({
        tipo: "mantenimiento", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `mantenimiento · ${r.equipo_nombre || "equipo"}`,
        detalle: r.tipo_mantenimiento || null,
      });
    });

    congelaciones.forEach(r => {
      lista.push({
        tipo: "congelacion", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `${r.operacion?.toLowerCase() || "congelación"} · ${r.producto || "producto"}`,
        detalle: r.temperatura_inicial != null ? `${r.temperatura_inicial}°C → ${r.temperatura_final ?? "—"}°C` : null,
      });
    });

    alergenos.forEach(r => {
      lista.push({
        tipo: "alergenos", fecha: r.created_date,
        hora: formatHora(r.created_date),
        quien: r.registrado_por || "Sistema",
        accion: `registro de alérgenos · ${r.producto || "producto"}`,
        detalle: r.alergenos?.length ? r.alergenos.join(", ") : null,
      });
    });

    checklists.forEach(r => {
      lista.push({
        tipo: "checklist", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.registrado_por || "Sistema",
        accion: `completó checklist · ${r.plantilla_nombre || ""}`,
        detalle: r.puntuacion != null ? `Puntuación: ${r.puntuacion}%` : null,
      });
    });

    auditorias.forEach(r => {
      lista.push({
        tipo: "auditoria", fecha: r.fecha,
        hora: formatHora(r.fecha),
        quien: r.auditor || "Sistema",
        accion: `auditoría interna · ${r.tipo === "restaurante" ? "Restaurante" : "Industria/Obrador"}`,
        detalle: r.puntuacion != null ? `Puntuación: ${r.puntuacion}%` : null,
      });
    });

    incidencias.forEach(r => {
      lista.push({
        tipo: "incidencia", fecha: r.fecha || r.created_date,
        hora: formatHora(r.fecha || r.created_date),
        quien: r.registrado_por || "Sistema",
        accion: `incidencia registrada · ${r.tipo || ""}`,
        detalle: r.descripcion ? r.descripcion.slice(0, 60) + (r.descripcion.length > 60 ? "…" : "") : null,
      });
    });

    lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    setEventos(lista);
  }

  if (loading) {
    return (
      <div className="px-5 py-6 space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="px-5 py-10 flex flex-col items-center gap-2">
        <Activity className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Sin actividad en las últimas 24h</p>
        <p className="text-xs text-muted-foreground/70">Los registros de hoy aparecerán aquí</p>
      </div>
    );
  }

  const visibles = verTodos ? eventos : eventos.slice(0, 8);

  return (
    <div className="px-5 py-2">
      <p className="text-[11px] text-muted-foreground py-2">{eventos.length} evento{eventos.length !== 1 ? "s" : ""} en las últimas 24h</p>
      {visibles.map((ev, i) => (
        <EventoItem key={i} evento={ev} isLast={i === visibles.length - 1 && (verTodos || eventos.length <= 8)} />
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