import React, { useState } from "react";
import {
  Building2, Users, Wrench, Settings, Shield, HelpCircle
} from "lucide-react";
import TabNegocio from "@/components/ajustes/TabNegocio";
import TabEquipos from "@/components/ajustes/TabEquipos";
import TabPreferencias from "@/components/ajustes/TabPreferencias";

const TABS = [
  { id: "negocio",       label: "Negocio",       icon: Building2 },
  { id: "usuarios",      label: "Usuarios",       icon: Users },
  { id: "equipos",       label: "Equipos",        icon: Wrench },
  { id: "preferencias",  label: "Preferencias",   icon: Settings },
  { id: "seguridad",     label: "Seguridad",      icon: Shield },
];

export default function Ajustes() {
  const [activeTab, setActiveTab] = useState("negocio");

  return (
    <div className="p-6 md:p-10 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A3E47]">Configuración</h1>
          <p className="text-lg text-[#6BB68A] font-medium mt-0.5">
            Gestiona tu negocio, perfil y preferencias
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A3E47] hover:bg-[#0a3340] text-white text-sm font-semibold transition-colors shrink-0">
          <HelpCircle className="w-4 h-4" />
          Ayuda / Soporte
        </button>
      </div>

      {/* Tabs nav */}
      <div className="flex items-center gap-1 bg-secondary rounded-2xl p-1.5 w-full">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-white text-[#0A3E47] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {activeTab === "negocio" && <TabNegocio />}
      {activeTab === "equipos" && <TabEquipos />}
      {activeTab === "preferencias" && <TabPreferencias />}
      {activeTab !== "negocio" && activeTab !== "equipos" && activeTab !== "preferencias" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
            {React.createElement(TABS.find(t => t.id === activeTab)?.icon || Settings, { className: "w-7 h-7 text-muted-foreground/50" })}
          </div>
          <p className="font-semibold text-foreground">Próximamente</p>
          <p className="text-sm text-muted-foreground">Esta sección estará disponible pronto.</p>
        </div>
      )}
    </div>
  );
}