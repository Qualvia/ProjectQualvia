import React, { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle, ShieldCheck, Plus, ChevronRight, Settings, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import ProgramarTareaDialog from "./ProgramarTareaDialog";
import AnadirTareaPuntualDialog from "./AnadirTareaPuntualDialog";
import GestionarTareasDialog from "./GestionarTareasDialog";

const MODULE_COLORS = {
  "Temperatura": "bg-[#E4F2EC] text-[#0A3E47]",
  "Limpieza":    "bg-[#E4F2EC] text-[#0A3E47]",
  "Plagas":      "bg-[#E4F2EC] text-[#0A3E47]",
  "Recepción":   "bg-[#E4F2EC] text-[#0A3E47]",
  "Agua":        "bg-[#E4F2EC] text-[#0A3E47]",
  "Formación":   "bg-[#E4F2EC] text-[#0A3E47]",
  "Lotes":       "bg-[#E4F2EC] text-[#0A3E47]",
  "Alérgenos":   "bg-[#E4F2EC] text-[#0A3E47]",
  "Congelación": "bg-[#E4F2EC] text-[#0A3E47]",
  "Residuos":    "bg-[#E4F2EC] text-[#0A3E47]",
  "Mantenimiento": "bg-[#E4F2EC] text-[#0A3E47]",
  "Otro":        "bg-[#E4F2EC] text-[#0A3E47]",
};

// Devuelve "YYYY-MM-DD" para hoy (local)
function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Mapa: "Lun"→1, "Mar"→2, ... (getDay() devuelve 0=Dom)
const DIA_MAP = { Lun: 1, Mar: 2, Mié: 3, Jue: 4, Vie: 5, Sáb: 6, Dom: 0 };

function tareaProgramadaCorrespondeHoy(tarea) {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=Dom … 6=Sáb
  const diaMes = hoy.getDate();
  const mes = hoy.getMonth() + 1; // 1-12

  switch (tarea.frecuencia) {
    case "Diaria":
      return true;
    case "Semanal": {
      if (!tarea.dias_semana || tarea.dias_semana.length === 0) return true;
      return tarea.dias_semana.some((d) => DIA_MAP[d] === diaSemana);
    }
    case "Mensual":
      return diaMes === (tarea.dia_mes || 1);
    case "Trimestral":
      return [1, 4, 7, 10].includes(mes) && diaMes === 1;
    case "Semestral":
      return [1, 7].includes(mes) && diaMes === 1;
    case "Anual":
      return mes === 1 && diaMes === 1;
    default:
      return false;
  }
}

export default function TareasIncidenciasBloque() {
  const { user, currentBusiness } = useBusiness();
  const navigate = useNavigate();

  const [ejecuciones, setEjecuciones] = useState([]);
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verTodasIncidencias, setVerTodasIncidencias] = useState(false);
  const [showProgramar, setShowProgramar] = useState(false);
  const [showPuntual, setShowPuntual] = useState(false);
  const [showGestionar, setShowGestionar] = useState(false);

  const hoy = hoyISO();

  // ── Carga principal ──────────────────────────────────────────────────────
  const cargarTareas = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) return;
    setLoading(true);

    const uid = user.id;
    const bid = currentBusiness.id;

    // 1. Ejecuciones ya existentes hoy para este user+business
    const existentes = await base44.entities.TareaEjecucion.filter({
      user_id: uid,
      business_id: bid,
      fecha_dia: hoy,
    });

    const idsYaCreados = new Set(existentes.map((e) => e.tarea_id).filter(Boolean));

    // 2. Tareas programadas activas de este user+business
    const programadas = await base44.entities.TareaProgramada.filter({
      user_id: uid,
      business_id: bid,
      activa: true,
    });

    // 3. Generar ejecuciones para las que corresponden hoy y aún no existen
    const nuevas = [];
    for (const tp of programadas) {
      if (!idsYaCreados.has(tp.id) && tareaProgramadaCorrespondeHoy(tp)) {
        const nueva = await base44.entities.TareaEjecucion.create({
          user_id: uid,
          business_id: bid,
          tarea_id: tp.id,
          titulo: tp.titulo,
          tipo: tp.tipo,
          hora: tp.hora || "",
          prioridad: tp.prioridad || "Media",
          completada: false,
          es_puntual: false,
          fecha_dia: hoy,
        });
        nuevas.push(nueva);
      }
    }

    setEjecuciones([...existentes, ...nuevas]);
    setLoading(false);
  }, [user?.id, currentBusiness?.id, hoy]);

  // ── Carga de incidencias ─────────────────────────────────────────────────
  const cargarIncidencias = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) return;
    const todas = await base44.entities.Incidencia.filter({
      user_id: user.id,
      business_id: currentBusiness.id,
    });
    setIncidencias(todas.filter((i) => i.estado !== "cerrada"));
  }, [user?.id, currentBusiness?.id]);

  useEffect(() => {
    cargarTareas();
    cargarIncidencias();
  }, [cargarTareas, cargarIncidencias]);

  // ── Toggle completada ────────────────────────────────────────────────────
  async function toggleTarea(ejecucion) {
    const nuevo = !ejecucion.completada;
    // Optimistic update
    setEjecuciones((prev) =>
      prev.map((e) => e.id === ejecucion.id ? { ...e, completada: nuevo } : e)
    );
    await base44.entities.TareaEjecucion.update(ejecucion.id, { completada: nuevo });
  }

  // ── Crear tarea programada ───────────────────────────────────────────────
  async function handleCrearProgramada(form) {
    if (!user?.id || !currentBusiness?.id) return;
    const uid = user.id;
    const bid = currentBusiness.id;

    const tp = await base44.entities.TareaProgramada.create({
      user_id: uid,
      business_id: bid,
      titulo: form.titulo,
      descripcion: form.descripcion || "",
      tipo: form.tipo,
      prioridad: form.prioridad || "Media",
      hora: form.hora || "",
      frecuencia: form.frecuencia,
      dias_semana: form.diasSemana || [],
      dia_mes: form.diaMes || 1,
      activa: true,
    });

    // Si corresponde hoy, crear ejecución inmediatamente
    if (tareaProgramadaCorrespondeHoy(tp)) {
      const nueva = await base44.entities.TareaEjecucion.create({
        user_id: uid,
        business_id: bid,
        tarea_id: tp.id,
        titulo: tp.titulo,
        tipo: tp.tipo,
        hora: tp.hora,
        prioridad: tp.prioridad,
        completada: false,
        es_puntual: false,
        fecha_dia: hoy,
      });
      setEjecuciones((prev) => [...prev, nueva]);
    }
  }

  // ── Crear tarea puntual ──────────────────────────────────────────────────
  async function handleCrearPuntual(form) {
    if (!user?.id || !currentBusiness?.id) return;
    const nueva = await base44.entities.TareaEjecucion.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      tarea_id: null,
      titulo: form.titulo,
      tipo: form.tipo,
      hora: form.hora || "",
      prioridad: form.prioridad || "Media",
      completada: false,
      es_puntual: true,
      fecha_dia: hoy,
    });
    setEjecuciones((prev) => [...prev, nueva]);
  }

  // ── Helpers UI ───────────────────────────────────────────────────────────
  const completadas = ejecuciones.filter((e) => e.completada).length;

  function formatHora(e) {
    if (e.hora) return e.hora;
    return e.es_puntual ? "Hoy" : "—";
  }

  function formatFechaInc(inc) {
    const d = new Date(inc.fecha || inc.created_date);
    return `${d.getDate()} ${["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][d.getMonth()]}`;
  }

  function tiempoSinResolver(inc) {
    const d = new Date(inc.fecha || inc.created_date);
    const horas = Math.floor((Date.now() - d.getTime()) / 3600000);
    if (horas < 24) return `${horas}h sin resolver`;
    return `${Math.floor(horas / 24)}d sin resolver`;
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">

      {/* COLUMNA IZQUIERDA — Tareas del día */}
      <div className="p-5 flex flex-col min-h-[220px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A3E47]" />
            <span className="font-semibold text-[#0A3E47] text-base">Tareas del día</span>
          </div>
          {/* Botón partido: acción principal + acceso al gestor */}
          <div className="flex items-stretch rounded-lg overflow-hidden border border-[#5aa377]">
            <button
              onClick={() => setShowProgramar(true)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#6BB68A] text-white hover:bg-[#5aa377] transition-all">
              <Plus className="w-3.5 h-3.5" />
              Programar tarea
            </button>
            <div className="w-px bg-[#5aa377]" />
            <button
              onClick={() => setShowGestionar(true)}
              title="Gestionar tareas"
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 bg-[#6BB68A] text-white hover:bg-[#5aa377] transition-all">
              <Settings className="w-3.5 h-3.5" />
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Lista */}
        <div className="mt-4 flex-1">
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : ejecuciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E4F2EC] flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#6BB68A]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Sin tareas para hoy</p>
              <p className="text-xs text-muted-foreground mt-0.5">Programa tareas recurrentes o añade una puntual.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {ejecuciones.map((tarea, i) => (
              <div key={tarea.id}>
                <div className="flex items-center gap-3 py-2.5">
                  <button
                    onClick={() => toggleTarea(tarea)}
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${
                      tarea.completada
                        ? "bg-[#6BB68A] border-[#6BB68A]"
                        : "border-border hover:border-[#6BB68A]"
                    }`}>
                    {tarea.completada && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm leading-tight ${tarea.completada ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {tarea.titulo}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${MODULE_COLORS[tarea.tipo] || "bg-secondary text-foreground"}`}>
                    {tarea.tipo}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0 w-14 text-right">{formatHora(tarea)}</span>
                </div>
                {i < ejecuciones.length - 1 && <div className="border-t border-border/50" />}
              </div>
            ))}
          </div>
        )}

        </div>
        {/* Pie */}
        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="text-xs text-muted-foreground">{completadas} de {ejecuciones.length} tareas completadas hoy</span>
          <button
            onClick={() => setShowPuntual(true)}
            className="text-[11px] text-[#6BB68A] hover:underline flex items-center gap-0.5">
            <Plus className="w-3 h-3" />
            Añadir tarea puntual de hoy
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA — Incidencias activas */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#0A3E47]" />
            <span className="font-semibold text-[#0A3E47] text-base">Incidencias activas</span>
          </div>
          <button
            onClick={() => navigate("/registros?tab=incidencias")}
            className="flex items-center gap-0.5 text-xs font-medium text-[#6BB68A] hover:underline">
            Ver todas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {incidencias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E4F2EC] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#6BB68A]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Sin incidencias activas</p>
              <p className="text-xs text-muted-foreground mt-0.5">Todo bajo control. Buen trabajo.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(verTodasIncidencias ? incidencias : incidencias.slice(0, 4)).map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate("/registros?tab=incidencias")}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-2 cursor-pointer hover:bg-red-100/60 transition-colors">
                <p className="text-sm text-foreground leading-snug">{inc.descripcion}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {inc.tipo} · {formatFechaInc(inc)} · <span className="text-red-500 font-medium">{tiempoSinResolver(inc)}</span>
                  </span>
                </div>
              </div>
            ))}
            {incidencias.length > 4 && (
              <button
                onClick={() => setVerTodasIncidencias(!verTodasIncidencias)}
                className="w-full text-xs font-medium text-[#6BB68A] border border-[#6BB68A]/40 rounded-lg py-2 hover:bg-[#6BB68A]/5 transition-colors">
                {verTodasIncidencias ? "Ver menos ▲" : `Ver ${incidencias.length - 4} más ▼`}
              </button>
            )}
          </div>
        )}
      </div>

    </div>

    <GestionarTareasDialog
      open={showGestionar}
      onClose={() => { setShowGestionar(false); cargarTareas(); }}
    />
    <AnadirTareaPuntualDialog
      open={showPuntual}
      onClose={() => setShowPuntual(false)}
      onCrear={handleCrearPuntual}
    />
    <ProgramarTareaDialog
      open={showProgramar}
      onClose={() => setShowProgramar(false)}
      onCrear={handleCrearProgramada}
    />
    </>
  );
}