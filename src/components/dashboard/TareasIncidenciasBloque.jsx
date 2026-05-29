import React, { useState } from "react";
import { Clock, AlertTriangle, ShieldCheck, Plus, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MODULE_COLORS = {
  "Temperatura": "bg-[#E4F2EC] text-[#2E7D52]",
  "Limpieza":    "bg-[#E4F2EC] text-[#2E7D52]",
  "Plagas":      "bg-[#E4F2EC] text-[#2E7D52]",
  "Recepción":   "bg-[#E4F2EC] text-[#2E7D52]",
  "Agua":        "bg-[#E4F2EC] text-[#2E7D52]",
  "Formación":   "bg-[#E4F2EC] text-[#2E7D52]",
  "Lotes":       "bg-[#E4F2EC] text-[#2E7D52]",
  "Alérgenos":   "bg-[#E4F2EC] text-[#2E7D52]",
  "Congelación": "bg-[#E4F2EC] text-[#2E7D52]",
  "Residuos":    "bg-[#E4F2EC] text-[#2E7D52]",
};

const TAREAS_INICIALES = [
  { id: 1, nombre: "Control temperatura apertura",   modulo: "Temperatura", hora: "08:15", completada: true },
  { id: 2, nombre: "Limpieza superficies cocina",     modulo: "Limpieza",    hora: "08:40", completada: true },
  { id: 3, nombre: "Control temperatura neveras",     modulo: "Temperatura", hora: "Diaria", completada: false },
  { id: 4, nombre: "Realizar control de plagas",      modulo: "Plagas",      hora: "Semanal", completada: false },
  { id: 5, nombre: "Control de la recepción",         modulo: "Recepción",   hora: "Diaria", completada: false },
  { id: 6, nombre: "Control cloro y pH agua",         modulo: "Agua",        hora: "Diaria", completada: false },
];

const INCIDENCIAS = [
  {
    id: 1,
    descripcion: "Temperatura fuera de rango en Congelador: 5,0°C (Permitido: -18°C / -15°C)",
    modulo: "Temperatura",
    fecha: "8 ene",
    tiempo: "48h sin resolver",
  },
];

export default function TareasIncidenciasBloque() {
  const [tareas, setTareas] = useState(TAREAS_INICIALES);
  const [verTodasIncidencias, setVerTodasIncidencias] = useState(false);
  const navigate = useNavigate();

  function toggleTarea(id) {
    setTareas((prev) => prev.map((t) => t.id === id ? { ...t, completada: !t.completada } : t));
  }

  const completadas = tareas.filter((t) => t.completada).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">

      {/* COLUMNA IZQUIERDA — Tareas del día */}
      <div className="p-5 space-y-4">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A3E47]" />
            <span className="font-semibold text-[#0A3E47] text-base">Tareas del día</span>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 bg-[#6BB68A] text-white hover:bg-[#5aa377] transition-all">
            <Plus className="w-3.5 h-3.5" />
            Programar tarea
          </button>
        </div>

        {/* Lista */}
        <div className="space-y-0">
          {tareas.map((tarea, i) => (
            <div key={tarea.id}>
              <div className="flex items-center gap-3 py-2.5">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTarea(tarea.id)}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-all ${
                    tarea.completada
                      ? "bg-[#6BB68A] border-[#6BB68A]"
                      : "border-border hover:border-[#6BB68A]"
                  }`}
                >
                  {tarea.completada && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>

                {/* Nombre */}
                <span className={`flex-1 text-sm leading-tight ${tarea.completada ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {tarea.nombre}
                </span>

                {/* Módulo pill */}
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${MODULE_COLORS[tarea.modulo] || "bg-secondary text-foreground"}`}>
                  {tarea.modulo}
                </span>

                {/* Hora/Frecuencia */}
                <span className="text-[11px] text-muted-foreground shrink-0 w-14 text-right">{tarea.hora}</span>
              </div>
              {i < tareas.length - 1 && <div className="border-t border-border/50" />}
            </div>
          ))}
        </div>

        {/* Pie */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">{completadas} de {tareas.length} tareas completadas hoy</span>
          <button className="text-xs text-[#6BB68A] hover:underline flex items-center gap-0.5">
            <Plus className="w-3 h-3" />
            Añadir tarea puntual de hoy
          </button>
        </div>
      </div>

      {/* COLUMNA DERECHA — Incidencias activas */}
      <div className="p-5 space-y-4">
        {/* Cabecera */}
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

        {/* Lista o estado vacío */}
        {INCIDENCIAS.length === 0 ? (
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
            {(verTodasIncidencias ? INCIDENCIAS : INCIDENCIAS.slice(0, 4)).map((inc) => (
              <div
                key={inc.id}
                onClick={() => navigate("/registros?tab=incidencias")}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-2 cursor-pointer hover:bg-red-100/60 transition-colors">
                <p className="text-sm text-foreground leading-snug">{inc.descripcion}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">
                    {inc.modulo} · {inc.fecha} · <span className="text-red-500 font-medium">{inc.tiempo}</span>
                  </span>
                </div>
              </div>
            ))}
            {INCIDENCIAS.length > 4 && (
              <button
                onClick={() => setVerTodasIncidencias(!verTodasIncidencias)}
                className="w-full text-xs font-medium text-[#6BB68A] border border-[#6BB68A]/40 rounded-lg py-2 hover:bg-[#6BB68A]/5 transition-colors">
                {verTodasIncidencias ? "Ver menos ▲" : `Ver ${INCIDENCIAS.length - 4} más ▼`}
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}