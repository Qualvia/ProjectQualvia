import React, { useState } from "react";
import GestionarEquiposDialog from "@/components/GestionarEquiposDialog";
import GestionarProveedoresDialog from "@/components/GestionarProveedoresDialog";
import NuevoRegistroTemperatura from "@/components/NuevoRegistroTemperatura";
import ListaRegistrosTemperatura from "@/components/ListaRegistrosTemperatura";
import NuevoRegistroLimpieza from "@/components/NuevoRegistroLimpieza";
import ListaRegistrosLimpieza from "@/components/ListaRegistrosLimpieza";
import {
  Thermometer,
  Droplets,
  ClipboardCheck,
  Waves,
  Bug,
  Wrench,
  GraduationCap,
  Apple,
  Package,
  Snowflake,
  Trash2,
  AlertTriangle,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const REGISTROS = [
  { id: "temperatura", label: "Temperatura", icon: Thermometer, color: "bg-red-500 border-red-500 text-white" },
  { id: "limpieza", label: "Limpieza", icon: Droplets, color: "bg-cyan-500 border-cyan-500 text-white" },
  { id: "recepcion", label: "Recepción", icon: ClipboardCheck, color: "bg-orange-400 border-orange-400 text-white" },
  { id: "agua", label: "Agua", icon: Waves, color: "bg-blue-500 border-blue-500 text-white" },
  { id: "plagas", label: "Plagas", icon: Bug, color: "bg-amber-700 border-amber-700 text-white" },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench, color: "bg-slate-500 border-slate-500 text-white" },
  { id: "formacion", label: "Formación", icon: GraduationCap, color: "bg-purple-500 border-purple-500 text-white" },
  { id: "alergenos", label: "Alérgenos", icon: Apple, color: "bg-yellow-500 border-yellow-500 text-white" },
  { id: "lotes", label: "Lotes", icon: Package, color: "bg-teal-500 border-teal-500 text-white" },
  { id: "congelacion", label: "Congelación", icon: Snowflake, color: "bg-sky-400 border-sky-400 text-white" },
  { id: "residuos", label: "Residuos", icon: Trash2, color: "bg-green-600 border-green-600 text-white" },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle, color: "" },
];

const INCIDENCIA_ALERT_COLOR = "bg-red-100 border-red-300 text-red-700";

export default function Registros() {
  const [active, setActive] = useState("temperatura");
  const [showGestionar, setShowGestionar] = useState(false);
  const [showProveedores, setShowProveedores] = useState(false);
  const [showNuevoRegistro, setShowNuevoRegistro] = useState(false);
  const [registroKey, setRegistroKey] = useState(0);
  const [limpiezaKey, setLimpiezaKey] = useState(0);
  const [hayFueraDeRango, setHayFueraDeRango] = useState(false);

  const activeRegistro = REGISTROS.find((r) => r.id === active);
  const ActiveIcon = activeRegistro?.icon;

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A3E47]">Registros</h1>
          <p className="text-base text-[#6BB68A] font-medium mt-0.5">
            Gestiona todos tus controles diarios
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Button className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2" onClick={() => setShowGestionar(true)}>
            <Plus className="w-4 h-4" />
            Gestionar equipos/zonas
          </Button>
          <Button variant="outline" className="border-[#6BB68A] text-[#6BB68A] hover:bg-[#6BB68A]/10 gap-2" onClick={() => setShowProveedores(true)}>
            <Plus className="w-4 h-4" />
            Gestionar proveedores
          </Button>
        </div>
      </div>

      {/* Grid de registros */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
        {REGISTROS.map(({ id, label, icon: Icon, color }) => {
          const isActive = active === id;
          const isIncidencia = id === "incidencias";
          const incidenciaAlert = isIncidencia && hayFueraDeRango;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all aspect-square
                ${isActive
                  ? color
                    ? `${color} shadow-md`
                    : incidenciaAlert
                      ? `${INCIDENCIA_ALERT_COLOR} shadow-md`
                      : "bg-slate-200 border-slate-300 text-foreground shadow-md"
                  : incidenciaAlert && !isActive
                    ? `${INCIDENCIA_ALERT_COLOR}`
                    : "bg-white border-border text-foreground hover:border-[#6BB68A] hover:shadow-sm"
                }`}
            >
              <Icon className="w-7 h-7" strokeWidth={2.5} />
              <span className="text-xs font-semibold leading-tight text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel del registro activo */}
      {activeRegistro && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {ActiveIcon && <ActiveIcon className="w-5 h-5 text-[#0A3E47]" strokeWidth={1.5} />}
              <span className="font-semibold text-[#0A3E47]">
                Control de {activeRegistro.label}
                {active === "temperatura" ? " (°C)" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="bg-white" onClick={() => setShowGestionar(true)}>
                <Settings className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
                onClick={() => setShowNuevoRegistro((v) => !v)}
              >
                <Plus className="w-4 h-4" />
                Nuevo registro
              </Button>
            </div>
          </div>

          {/* Formulario inline de nuevo registro */}
          {showNuevoRegistro && active === "temperatura" && (
            <NuevoRegistroTemperatura
              onCancel={() => setShowNuevoRegistro(false)}
              onSaved={() => {
                setShowNuevoRegistro(false);
                setRegistroKey((k) => k + 1);
              }}
            />
          )}
          {showNuevoRegistro && active === "limpieza" && (
            <NuevoRegistroLimpieza
              onCancel={() => setShowNuevoRegistro(false)}
              onSaved={() => {
                setShowNuevoRegistro(false);
                setLimpiezaKey((k) => k + 1);
              }}
            />
          )}

          {/* Lista de registros guardados */}
          {active === "temperatura" && (
            <ListaRegistrosTemperatura refreshKey={registroKey} onFueraDeRangoChange={setHayFueraDeRango} />
          )}
          {active === "limpieza" && (
            <ListaRegistrosLimpieza refreshKey={limpiezaKey} />
          )}
        </div>
      )}
      <GestionarEquiposDialog open={showGestionar} onOpenChange={setShowGestionar} />
      <GestionarProveedoresDialog open={showProveedores} onOpenChange={setShowProveedores} />
    </div>
  );
}