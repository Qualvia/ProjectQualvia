import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Trash2, Plus, X } from "lucide-react";

export default function ChecklistFormDialog({ plantilla, onClose, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const [nombre, setNombre] = useState(plantilla?.nombre || "");
  const [descripcion, setDescripcion] = useState(plantilla?.descripcion || "");
  const [items, setItems] = useState(plantilla?.items?.length ? plantilla.items : [{ texto: "" }]);
  const [saving, setSaving] = useState(false);

  function addItem() { setItems((prev) => [...prev, { texto: "" }]); }
  function removeItem(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }
  function updateItem(i, val) { setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, texto: val } : it)); }

  async function handleSave() {
    if (!nombre.trim() || items.every((it) => !it.texto.trim())) return;
    setSaving(true);
    const data = {
      user_id: user.id,
      business_id: currentBusiness.id,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      items: items.filter((it) => it.texto.trim()),
    };
    if (plantilla) {
      await base44.entities.ChecklistPlantilla.update(plantilla.id, data);
    } else {
      await base44.entities.ChecklistPlantilla.create(data);
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <h2 className="text-xl font-bold text-foreground">{plantilla ? "Editar Checklist" : "Nuevo Checklist"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Nombre del checklist *</label>
            <input
              type="text"
              placeholder="Ej: Apertura de cocina"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full h-10 rounded-xl border-2 border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Descripción</label>
            <textarea
              placeholder="Breve descripción..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:border-[#6BB68A] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Ítems *</label>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Ítem ${i + 1}`}
                    value={it.texto}
                    onChange={(e) => updateItem(i, e.target.value)}
                    className="flex-1 h-9 rounded-xl border border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A]"
                  />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-[#6BB68A] hover:text-[#6BB68A] transition-colors"
              >
                <Plus className="w-4 h-4" /> Añadir ítem
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-secondary transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !nombre.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}