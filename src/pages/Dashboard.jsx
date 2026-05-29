import React, { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { base44 } from "@/api/base44Client";
import { AlertCircle, ClipboardCheck, Flame, Sparkles, Lightbulb, Bot, Clock, BarChart2, Activity, ClipboardList, FileText, Users, BarChart } from "lucide-react";
import TareasIncidenciasBloque from "@/components/dashboard/TareasIncidenciasBloque";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DashboardBloque from "@/components/dashboard/DashboardBloque";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function today() {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function saludo() {
  const h = new Date().getHours();
  if (h >= 6 && h < 13) return "Buenos días";
  if (h >= 13 && h < 20) return "Buenas tardes";
  return "Buenas noches";
}



const CONSEJO = "Establece un sistema de codificación para los ingredientes y productos en tu cocina, asignando un lote y fecha de ingreso a cada uno. Esto facilitará la gestión de inventario y asegurará el seguimiento en caso de cualquier incidencia, mejorando la trazabilidad de los alimentos.";

const BLOQUES_INICIALES = [
  { id: "tareas", title: "Tareas e Incidencias", icon: Clock },

  { id: "graficos", title: "Gráficos y evolución", icon: BarChart2 },
  { id: "actividad", title: "Actividad reciente", icon: Activity },
];

export default function Dashboard() {
  const { user } = useBusiness();
  const navigate = useNavigate();
  const nombre = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "usuario";
  const [bloques, setBloques] = useState(BLOQUES_INICIALES);
  const [tareasStats, setTareasStats] = useState({ completadas: 0, total: 0 });
  const [incidenciasStats, setIncidenciasStats] = useState({ total: 0, criticas: 0, maxHoras: 0 });

  useEffect(() => {
    base44.entities.Incidencia.list().then((todas) => {
      const activas = todas.filter((i) => i.estado !== "cerrada");
      const criticas = activas.filter((i) => i.prioridad === "critica").length;
      const maxHoras = activas.reduce((max, i) => {
        const h = Math.floor((Date.now() - new Date(i.fecha || i.created_date).getTime()) / 3600000);
        return h > max ? h : max;
      }, 0);
      setIncidenciasStats({ total: activas.length, criticas, maxHoras });
    });
  }, []);

  function onDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(bloques);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setBloques(items);
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-[#0A3E47]">{saludo()}, {nombre}</h1>
          <p className="text-base text-[#6BB68A] font-medium mt-0.5">Sigamos cuidando la calidad juntos.</p>
          <p className="text-sm text-muted-foreground mt-0.5">{today()}</p>
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
        <div className="bg-white rounded-2xl border-2 border-border shadow-sm px-5 py-3.5 flex flex-col animate-kpi-1" style={{ borderLeft: "8px solid #EDE6DA" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEE8E8" }}>
              <AlertCircle className="w-6 h-6" style={{ color: "#C0392B" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold leading-none" style={{ fontSize: "36px", letterSpacing: "-0.03em", color: "#1B1B1B" }}>{incidenciasStats.total}</span>
              <span className="text-[12px] font-medium" style={{ color: "#8A8278" }}>Incidencias activas</span>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-3">
            <span className="text-[11px]" style={{ color: "#8A8278" }}>
              {incidenciasStats.criticas > 0 ? `${incidenciasStats.criticas} crítica${incidenciasStats.criticas > 1 ? "s" : ""} · ` : ""}
              {incidenciasStats.total === 0 ? "Sin incidencias abiertas" : incidenciasStats.maxHoras >= 48 ? `más de 48h sin resolver` : `${incidenciasStats.maxHoras}h sin resolver`}
            </span>
          </div>
        </div>

        {/* KPI 2 — Tareas completadas hoy */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-sm px-5 py-3.5 flex flex-col animate-kpi-2" style={{ borderLeft: "8px solid #EDE6DA" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FEF3DC" }}>
              <ClipboardCheck className="w-6 h-6" style={{ color: "#D97706" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold leading-none" style={{ fontSize: "36px", letterSpacing: "-0.03em", color: "#1B1B1B" }}>
                {tareasStats.completadas} <span style={{ fontSize: "24px", color: "#8A8278", fontWeight: 500 }}>/ {tareasStats.total}</span>
              </span>
              <span className="text-[12px] font-medium" style={{ color: "#8A8278" }}>Tareas completadas hoy</span>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-3 flex flex-col gap-1.5">
            <div className="h-[4px] rounded-full w-full" style={{ background: "#EDE6DA" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: tareasStats.total > 0 ? `${Math.round((tareasStats.completadas / tareasStats.total) * 100)}%` : "0%", background: "#D97706" }} />
            </div>
            <div className="flex justify-between">
              <span className="text-[11px]" style={{ color: "#D97706" }}>
                {tareasStats.total > 0 ? `${Math.round((tareasStats.completadas / tareasStats.total) * 100)}% completado` : "Sin tareas"}
              </span>
              <span className="text-[11px]" style={{ color: "#8A8278" }}>{tareasStats.total - tareasStats.completadas} pendientes</span>
            </div>
          </div>
        </div>

        {/* KPI 3 — Días consecutivos */}
        <div className="bg-white rounded-2xl border-2 border-border shadow-sm px-5 py-3.5 flex flex-col animate-kpi-3" style={{ borderLeft: "8px solid #EDE6DA" }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E4F2EC" }}>
              <Flame className="w-6 h-6" style={{ color: "#2E7D52" }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold leading-none" style={{ fontSize: "36px", letterSpacing: "-0.03em", color: "#1B1B1B" }}>14</span>
              </div>
              <span className="text-[12px] font-medium" style={{ color: "#8A8278" }}>Días consecutivos al día</span>
            </div>
          </div>
          <div className="border-t border-border mt-4 pt-3">
            <span className="text-[11px]" style={{ color: "#8A8278" }}>Tu mejor racha este mes</span>
          </div>
        </div>

      </div>

      {/* Consejo del día */}
      <div className="bg-gradient-to-b from-[#1a6b5a] to-[#6BB68A] rounded-2xl p-5 flex gap-4 items-start">
        <div className="bg-white/20 rounded-xl p-2.5 shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">Consejo inteligente del día</p>
          <p className="text-sm text-white/85 leading-relaxed">{CONSEJO}</p>
        </div>
      </div>

      {/* Bloques drag & drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-bloques">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4">
              {bloques.map((bloque, index) => (
                <Draggable key={bloque.id} draggableId={bloque.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}>
                      <DashboardBloque
                        title={bloque.title}
                        icon={bloque.icon}
                        dragHandleProps={provided.dragHandleProps}>
                        {bloque.id === "tareas" ? (
                          <TareasIncidenciasBloque onEjecucionesChange={(ej) => setTareasStats({ completadas: ej.filter(e => e.completada).length, total: ej.length })} />
                        ) : (
                          <div className="px-5 py-4">
                            <p className="text-sm text-muted-foreground">Contenido próximamente...</p>
                          </div>
                        )}
                      </DashboardBloque>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4" style={{ background: "#EDE6DA" }}>
          <Sparkles className="w-5 h-5 text-[#0A3E47] shrink-0" />
          <h2 className="text-lg font-semibold text-[#0A3E47]">Acciones rápidas</h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/checklist?tab=auditorias")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-[#6BB68A] hover:bg-[#6BB68A]/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#E4F2EC] flex items-center justify-center group-hover:bg-[#6BB68A]/20 transition-colors">
              <ClipboardList className="w-5 h-5 text-[#6BB68A]" />
            </div>
            <span className="text-sm font-medium text-foreground">Auditorías</span>
          </button>
          <button
            onClick={() => navigate("/documentos")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-[#6BB68A] hover:bg-[#6BB68A]/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#E4F2EC] flex items-center justify-center group-hover:bg-[#6BB68A]/20 transition-colors">
              <FileText className="w-5 h-5 text-[#6BB68A]" />
            </div>
            <span className="text-sm font-medium text-foreground">APPCC</span>
          </button>
          <button
            onClick={() => navigate("/registros?accion=proveedores")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-[#6BB68A] hover:bg-[#6BB68A]/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#E4F2EC] flex items-center justify-center group-hover:bg-[#6BB68A]/20 transition-colors">
              <Users className="w-5 h-5 text-[#6BB68A]" />
            </div>
            <span className="text-sm font-medium text-foreground">Proveedores</span>
          </button>
          <button
            onClick={() => navigate("/documentos?tab=informes")}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-[#6BB68A] hover:bg-[#6BB68A]/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#E4F2EC] flex items-center justify-center group-hover:bg-[#6BB68A]/20 transition-colors">
              <BarChart className="w-5 h-5 text-[#6BB68A]" />
            </div>
            <span className="text-sm font-medium text-foreground">Informes</span>
          </button>
        </div>
      </div>

    </div>
  );
}