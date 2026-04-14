import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Download, Pencil, Trash2, Loader2, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const EMPTY = {
  nombre: "", cif_nif: "", contacto: "", telefono: "",
  email: "", direccion: "", productos: "",
  registro_sanitario: "", certificaciones: "", observaciones: "",
};

export default function GestionarProveedoresDialog({ open, onOpenChange }) {
  const { currentBusiness } = useBusiness();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !currentBusiness) return;
    load();
  }, [open, currentBusiness]);

  async function load() {
    setLoading(true);
    const data = await base44.entities.Proveedor.filter({ business_id: currentBusiness.id });
    setProveedores(data);
    setLoading(false);
  }

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = { ...form, business_id: currentBusiness.id };
    if (editingId) {
      await base44.entities.Proveedor.update(editingId, payload);
    } else {
      await base44.entities.Proveedor.create(payload);
    }
    await load();
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
    setSaving(false);
  }

  function handleEdit(p) {
    setForm({ ...EMPTY, ...p });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    await base44.entities.Proveedor.delete(id);
    setProveedores((prev) => prev.filter((p) => p.id !== id));
  }

  function handleCancel() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-[#0A3E47]" />
            Gestión de Proveedores
          </DialogTitle>
        </DialogHeader>

        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground">Gestiona tus proveedores y sus datos de contacto</p>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 text-[#6BB68A] border-[#6BB68A] hover:bg-[#6BB68A]/10">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button
              className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
              onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY); }}
            >
              <Plus className="w-4 h-4" />
              Nuevo proveedor
            </Button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-secondary rounded-xl p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nombre del proveedor *</Label>
                <Input placeholder="Ej: Distribuciones García" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>CIF/NIF</Label>
                <Input placeholder="B12345678" value={form.cif_nif} onChange={(e) => set("cif_nif", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Persona de contacto</Label>
                <Input placeholder="Nombre del contacto" value={form.contacto} onChange={(e) => set("contacto", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input placeholder="600 000 000" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input placeholder="contacto@proveedor.com" value={form.email} onChange={(e) => set("email", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Dirección</Label>
                <Input placeholder="Dirección completa" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} className="bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Productos que suministra</Label>
              <Textarea placeholder="Ej: Verduras frescas, frutas de temporada..." value={form.productos} onChange={(e) => set("productos", e.target.value)} className="bg-white resize-none h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Registro Sanitario</Label>
                <Input placeholder="Ej: 40.00000/M" value={form.registro_sanitario} onChange={(e) => set("registro_sanitario", e.target.value)} className="bg-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Certificaciones</Label>
                <Input placeholder="Ej: ISO 9001, IFS, BRC..." value={form.certificaciones} onChange={(e) => set("certificaciones", e.target.value)} className="bg-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Observaciones</Label>
              <Textarea placeholder="Notas adicionales..." value={form.observaciones} onChange={(e) => set("observaciones", e.target.value)} className="bg-white resize-none h-20" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel} className="bg-white">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving || !form.nombre.trim()} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Guardar proveedor
              </Button>
            </div>
          </div>
        )}

        {/* List */}
        <div>
          <p className="font-semibold text-[#0A3E47] mb-3">
            Proveedores registrados ({proveedores.length})
          </p>
          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : proveedores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay proveedores registrados</p>
          ) : (
            <div className="space-y-2">
              {proveedores.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{p.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {[p.cif_nif, p.contacto, p.telefono].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-[#6BB68A] hover:opacity-70 transition-opacity">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-destructive hover:opacity-70 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}