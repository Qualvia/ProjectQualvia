import React, { useState } from "react";
import GestionarEquiposDialog from "@/components/GestionarEquiposDialog";
import GestionarProveedoresDialog from "@/components/GestionarProveedoresDialog";
import NuevoRegistroTemperatura from "@/components/NuevoRegistroTemperatura";
import ListaRegistrosTemperatura from "@/components/ListaRegistrosTemperatura";
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
  { id: "temperatura", label: "Temperatura", icon: Thermometer },
  { id: "limpieza", label: "Limpieza", icon: Droplets },
  { id: "recepcion", label: "Recepción", icon: ClipboardCheck },
  { id: "agua", label: "Agua", icon: Waves },
  { id: "plagas", label: "Plagas", icon: Bug },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench },
  { id: "formacion", label: "Formación", icon: GraduationCap },
  { id: "alergenos", label: "Alérgenos", icon: Apple },
  { id: "lotes", label: "Lotes", icon: Package },
  { id: "congelacion", label: "Congelación", icon: Snowflake },
  { id: "residuos", label: "Residuos", icon: Trash2 },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle },
];

export default function Registros() {
  const [active, setActive] = useState("temperatura");
  const [showGestionar, setShowGestionar] = useState(false);
  const [showProveedores, setShowProveedores] = useState(false);
  const [showNuevoRegistro, setShowNuevoRegistro] = useState(false);
  const [registroKey, setRegistroKey] = useState(0);

  const activeRegistro = REGISTROS.find((r) => r.id === active);
  const ActiveIcon = activeRegistro?.icon;

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A3E47]">Registros</h1>
          <p className="text-sm text-[#6BB68A] font-medium mt-0.5">
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
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {REGISTROS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all aspect-square
                ${isActive
                  ? "bg-[#E05252] border-[#E05252] text-white shadow-md"
                  : "bg-white border-border text-foreground hover:border-[#6BB68A] hover:shadow-sm"
                }`}
            >
              <Icon className="w-7 h-7" strokeWidth={1.5} />
              <span className="text-xs font-medium leading-tight text-center">{label}</span>
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
              <Button variant="outline" size="icon" className="bg-white">
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

          {/* Formulario inline de nuevo registro (solo temperatura por ahora) */}
          {showNuevoRegistro && active === "temperatura" && (
            <NuevoRegistroTemperatura
              onCancel={() => setShowNuevoRegistro(false)}
              onSaved={() => {
                setShowNuevoRegistro(false);
                setRegistroKey((k) => k + 1);
              }}
            />
          )}

          {/* Lista de registros guardados */}
          {active === "temperatura" && (
            <ListaRegistrosTemperatura refreshKey={registroKey} />
          )}
        </div>
      )}
      <GestionarEquiposDialog open={showGestionar} onOpenChange={setShowGestionar} />
      <GestionarProveedoresDialog open={showProveedores} onOpenChange={setShowProveedores} />
    </div>
  );
}