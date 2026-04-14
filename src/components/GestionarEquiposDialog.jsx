import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Droplets, Waves, Bug, Sparkles, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const TABS = [
  { id: "equipos", label: "Equipos de temperatura" },
  { id: "zonas", label: "Zonas de limpieza", icon: Droplets },
  { id: "agua", label: "Puntos de agua", icon: Waves },
  { id: "plagas", label: "Puntos de plagas", icon: Bug },
  { id: "productos", label: "Productos limpieza", icon: Sparkles },
];

const TIPOS_EQUIPO = [
  "Cámara frigorífica", "Nevera", "Congelador", "Vitrina refrigerada",
  "Arcón congelador", "Abatidor", "Otro",
];

const ENTITY_MAP = {
  equipos: "EquipoTemperatura",
  zonas: "ZonaLimpieza",
  agua: "PuntoAgua",
  plagas: "PuntoPlaga",
  productos: "ProductoLimpieza",
};

const TAB_LABELS = {
  equipos: "Equipos de temperatura",
  zonas: "Zonas de limpieza",
  agua: "Puntos de agua",
  plagas: "Puntos de plagas",
  productos: "Productos limpieza",
};

function emptyForm(tab) {
  if (tab === "equipos") return { tipo: "", nombre: "", ubicacion: "", descripcion: "", temp_min: 0, temp_max: 5 };
  return { nombre: "", ubicacion: "" };
}

function ItemList({ items, onEdit, onDelete }) {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-foreground">{item.nombre}</p>
            <p className="text-xs text-muted-foreground">
              {item.temp_min !== undefined
                ? `Rango: ${item.temp_min}°C – ${item.temp_max}°C`
                : item.ubicacion || "—"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(item)} className="text-[#6BB68A] hover:opacity-70 transition-opacity">
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(item.id)} className="text-destructive hover:opacity-70 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GestionarEquiposDialog({ open, onOpenChange }) {
  const { currentBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState("equipos");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm("equipos"));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const entityName = ENTITY_MAP[activeTab];

  // Load items whenever tab or dialog opens
  useEffect(() => {
    if (!open || !currentBusiness) return;
    loadItems();
  }, [open, activeTab, currentBusiness]);

  // Reset form when tab changes
  useEffect(() => {
    setForm(emptyForm(activeTab));
    setEditingId(null);
  }, [activeTab]);

  async function loadItems() {
    setLoading(true);
    const data = await base44.entities[entityName].filter({ business_id: currentBusiness.id });
    setItems(data);
    setLoading(false);
  }

  async function handleSave() {
    if (!form.nombre?.trim()) return;
    setSaving(true);
    const payload = { ...form, business_id: currentBusiness.id };
    if (editingId) {
      await base44.entities[entityName].update(editingId, payload);
    } else {
      await base44.entities[entityName].create(payload);
    }
    setForm(emptyForm(activeTab));
    setEditingId(null);
    await loadItems();
    setSaving(false);
  }

  function handleEdit(item) {
    setForm(item);
    setEditingId(item.id);
  }

  async function handleDelete(id) {
    await base44.entities[entityName].delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const isEquipos = activeTab === "equipos";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gestionar Equipos, Zonas y Productos</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap border-b pb-3">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id ? "bg-foreground text-white" : "text-muted-foreground hover:bg-muted"}`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-secondary rounded-xl p-5 space-y-4">
          {isEquipos && (
            <div>
              <Label className="mb-1.5 block">Tipo de equipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona un tipo de equipo..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_EQUIPO.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Nombre *</Label>
              <Input
                placeholder={isEquipos ? "Ej: Nevera 1" : "Nombre"}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="bg-white"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Ubicación</Label>
              <Input
                placeholder="Ubicación física"
                value={form.ubicacion}
                onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                className="bg-white"
              />
            </div>
          </div>

          {isEquipos && (
            <>
              <div>
                <Label className="mb-1.5 block">Descripción</Label>
                <Textarea
                  placeholder="Descripción adicional..."
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="bg-white resize-none h-20"
                />
              </div>
              <div className="bg-white rounded-xl border border-border p-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-sm">Temperatura mínima (°C) *</Label>
                  <Input type="number" value={form.temp_min} onChange={(e) => setForm({ ...form, temp_min: Number(e.target.value) })} className="bg-white" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">Temperatura máxima (°C) *</Label>
                  <Input type="number" value={form.temp_max} onChange={(e) => setForm({ ...form, temp_max: Number(e.target.value) })} className="bg-white" />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !form.nombre?.trim()} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Guardar cambios" : "Añadir"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={() => { setForm(emptyForm(activeTab)); setEditingId(null); }}>
                Cancelar
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : items.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-[#0A3E47]">
                {TAB_LABELS[activeTab]} registrados ({items.length})
              </p>
              <ItemList items={items} onEdit={handleEdit} onDelete={handleDelete} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">No hay elementos registrados aún.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}