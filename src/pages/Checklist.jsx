import React, { useState } from "react";
import { CheckSquare, History, ClipboardList, Plus } from "lucide-react";
import TabChecklists from "@/components/checklist/TabChecklists";
import TabHistorico from "@/components/checklist/TabHistorico";
import TabAuditorias from "@/components/checklist/TabAuditorias";
import ChecklistFormDialog from "@/components/checklist/ChecklistFormDialog";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";

const TABS = [
  { id: "checklists", label: "Checklist", icon: CheckSquare },
  { id: "historico", label: "Histórico", icon: History },
  { id: "auditorias", label: "Auditorías", icon: ClipboardList },
];

export default function Checklist() {
  const [activeTab, setActiveTab] = useState("checklists");
  const [historicoKey, setHistoricoKey] = useState(0);
  const [showNuevo, setShowNuevo] = useState(false);
  const [checklistsKey, setChecklistsKey] = useState(0);
  const { user } = useBusiness();
  const { esOperario } = useUsuarioInterno();

  function handleCompletado() {
    setHistoricoKey((k) => k + 1);
  }

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A3E47]">Checklists y Auditorías</h1>
          <p className="text-lg text-[#6BB68A] font-medium mt-0.5">
            Gestiona y ejecuta listas de control para tu negocio
          </p>
        </div>
        {!esOperario && activeTab === "checklists" && (
          <button
            onClick={() => setShowNuevo(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors shrink-0 mt-1"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo checklist
          </button>
        )}
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
      {activeTab === "checklists" && (
        <TabChecklists key={checklistsKey} onChecklistCompletado={handleCompletado} />
      )}
      {activeTab === "historico" && (
        <TabHistorico refreshKey={historicoKey} />
      )}
      {activeTab === "auditorias" && (
        <TabAuditorias onIniciarAuditoria={(tipo) => console.log("Iniciar auditoría:", tipo)} />
      )}

      {showNuevo && (
        <ChecklistFormDialog
          onClose={() => setShowNuevo(false)}
          onSaved={() => { setShowNuevo(false); setChecklistsKey((k) => k + 1); }}
        />
      )}
    </div>
  );
}