import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Droplets, Waves, Bug, Sparkles, Plus } from "lucide-react";

const TABS = [
  { id: "equipos", label: "Equipos de temperatura", icon: null },
  { id: "zonas", label: "Zonas de limpieza", icon: Droplets },
  { id: "agua", label: "Puntos de agua", icon: Waves },
  { id: "plagas", label: "Puntos de plagas", icon: Bug },
  { id: "productos", label: "Productos limpieza", icon: Sparkles },
];

const TIPOS_EQUIPO = [
  "Cámara frigorífica", "Nevera", "Congelador", "Vitrina refrigerada",
  "Arcón congelador", "Abatidor", "Otro",
];

function EquiposForm() {
  const [form, setForm] = useState({ tipo: "", nombre: "", ubicacion: "", descripcion: "", tempMin: 0, tempMax: 5 });
  return (
    <div className="space-y-4">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Nombre *</Label>
          <Input placeholder="Ej: Nevera 1" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="bg-white" />
        </div>
        <div>
          <Label className="mb-1.5 block">Ubicación</Label>
          <Input placeholder="Ubicación física" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="bg-white" />
        </div>
      </div>
      <div>
        <Label className="mb-1.5 block">Descripción</Label>
        <Textarea placeholder="Descripción adicional..." value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="bg-white resize-none h-20" />
      </div>
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block text-sm">Temperatura mínima (°C) *</Label>
            <Input type="number" value={form.tempMin} onChange={(e) => setForm({ ...form, tempMin: e.target.value })} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Temperatura máxima (°C) *</Label>
            <Input type="number" value={form.tempMax} onChange={(e) => setForm({ ...form, tempMax: e.target.value })} className="bg-white" />
          </div>
        </div>
      </div>
      <Button className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2">
        <Plus className="w-4 h-4" /> Añadir
      </Button>
    </div>
  );
}

function GenericForm({ namePlaceholder, extraFields }) {
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Nombre *</Label>
          <Input placeholder={namePlaceholder} value={nombre} onChange={(e) => setNombre(e.target.value)} className="bg-white" />
        </div>
        <div>
          <Label className="mb-1.5 block">Ubicación</Label>
          <Input placeholder="Ubicación física" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className="bg-white" />
        </div>
      </div>
      {extraFields}
      <Button className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2">
        <Plus className="w-4 h-4" /> Añadir
      </Button>
    </div>
  );
}

const TAB_CONTENT = {
  equipos: <EquiposForm />,
  zonas: <GenericForm namePlaceholder="Ej: Cocina principal" />,
  agua: <GenericForm namePlaceholder="Ej: Grifo principal" />,
  plagas: <GenericForm namePlaceholder="Ej: Trampa 1" />,
  productos: <GenericForm namePlaceholder="Ej: Desinfectante A" />,
};

export default function GestionarEquiposDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("equipos");

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
                ${activeTab === id
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:bg-muted"
                }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="bg-secondary rounded-xl p-5">
          {TAB_CONTENT[activeTab]}
        </div>
      </DialogContent>
    </Dialog>
  );
}