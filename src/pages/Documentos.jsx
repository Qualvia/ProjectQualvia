import React, { useState } from "react";
import TabDocumentos from "@/components/documentos/TabDocumentos";
import TabInformes from "@/components/documentos/TabInformes";
import TabRecursos from "@/components/documentos/TabRecursos";
import { FileText, BarChart2, Library } from "lucide-react";

const TABS = [
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "informes", label: "Informes", icon: BarChart2 },
  { id: "recursos", label: "Recursos", icon: Library },
];

export default function Documentos() {
  const params = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(params.get("tab") || "documentos");

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-[#0A3E47]">Documentos, informes y recursos</h1>
        <p className="text-lg text-[#6BB68A] font-medium mt-0.5">
          Genera documentación profesional con IA en formato PDF y gestiona tu biblioteca
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-secondary rounded-2xl p-1 flex gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all ${
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

      {/* Tab Content */}
      {activeTab === "documentos" && <TabDocumentos />}
      {activeTab === "informes" && <TabInformes />}
      {activeTab === "recursos" && <TabRecursos />}
    </div>
  );
}