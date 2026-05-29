import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { marcarTareaCompletada } from "@/utils/marcarTareaCompletada";

const ALERGENOS = [
  "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja",
  "Lácteos", "Frutos Cáscara", "Apio", "Mostaza", "Sésamo", "Sulfitos",
  "Altramuces", "Moluscos",
];

export default function NuevoRegistroAlergeno({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const { nombreRegistrador } = useUsuarioInterno();
  const [proveedores, setProveedores] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modoManual, setModoManual] = useState(false);

  const [form, setForm] = useState({
    producto: "",
    proveedorSeleccionado: "",
    proveedorManual: "",
    lote: "",
    alergenos: [],
    medidas_preventivas: "",
    observaciones: "",
  });

  useEffect(() => {
    if (!currentBusiness) { setLoadingData(false); return; }
    base44.entities.Proveedor.filter({ business_id: currentBusiness.id })
      .then((data) => {
        setProveedores(data);
        if (data.length === 0) setModoManual(true);
        setLoadingData(false);
      })
      .catch(() => { setProveedores([]); setModoManual(true); setLoadingData(false); });
  }, [currentBusiness]);

  function setField(field, val) { setForm((prev) => ({ ...prev, [field]: val })); }

  function toggleAlergeno(a) {
    setForm((prev) => ({
      ...prev,
      alergenos: prev.alergenos.includes(a)
        ? prev.alergenos.filter((x) => x !== a)
        : [...prev.alergenos, a],
    }));
  }

  const proveedorFinal = modoManual ? form.proveedorManual : form.proveedorSeleccionado;
  const canSave = form.producto.trim() && form.alergenos.length > 0;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await base44.entities.RegistroAlergeno.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      producto: form.producto.trim(),
      proveedor: proveedorFinal.trim() || undefined,
      lote: form.lote || undefined,
      alergenos: form.alergenos,
      medidas_preventivas: form.medidas_preventivas || undefined,
      observaciones: form.observaciones || undefined,
      origen: "manual",
      registrado_por: nombreRegistrador || user.full_name || user.email,
      fecha: new Date().toISOString(),
    });
    await marcarTareaCompletada("Alérgenos", user.id, currentBusiness.id);
    setSaving(false);
    onSaved();
  }

  if (loadingData) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      {/* Producto + Proveedor */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-1.5 block">Producto / Materia prima *</Label>
          <Input
            placeholder="Nombre del producto"
            value={form.producto}
            onChange={(e) => setField("producto", e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Proveedor</Label>
          {!modoManual && proveedores.length > 0 ? (
            <div className="space-y-1">
              <select
                value={form.proveedorSeleccionado}
                onChange={(e) => {
                  if (e.target.value === "__manual__") { setModoManual(true); setField("proveedorSeleccionado", ""); }
                  else setField("proveedorSeleccionado", e.target.value);
                }}
                className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Selecciona proveedor...</option>
                {proveedores.map((p) => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
              <button onClick={() => setModoManual(true)} className="text-xs text-[#6BB68A] hover:underline">
                Escribir manualmente
              </button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Input
                placeholder="Nombre del proveedor"
                value={form.proveedorManual}
                onChange={(e) => setField("proveedorManual", e.target.value)}
                className="bg-white"
              />
              {proveedores.length > 0 && (
                <button onClick={() => { setModoManual(false); setField("proveedorManual", ""); }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 shrink-0" title="Volver a lista">↩</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lote */}
      <div className="w-1/2">
        <Label className="mb-1.5 block">Lote</Label>
        <Input placeholder="Nº de lote" value={form.lote} onChange={(e) => setField("lote", e.target.value)} className="bg-white" />
      </div>

      {/* Alérgenos */}
      <div>
        <Label className="mb-2 block">Alérgenos presentes *</Label>
        <div className="grid grid-cols-3 gap-2">
          {ALERGENOS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAlergeno(a)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium text-left transition-colors
                ${form.alergenos.includes(a)
                  ? "bg-yellow-400 border-yellow-400 text-white"
                  : "bg-white border-border text-foreground hover:border-yellow-400"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Medidas preventivas */}
      <div>
        <Label className="mb-1.5 block">Medidas preventivas</Label>
        <Textarea
          placeholder="Medidas para evitar contaminación cruzada..."
          value={form.medidas_preventivas}
          onChange={(e) => setField("medidas_preventivas", e.target.value)}
          className="bg-white resize-none h-20"
        />
      </div>

      {/* Observaciones */}
      <div>
        <Label className="mb-1.5 block">Observaciones</Label>
        <Textarea
          placeholder="Observaciones adicionales..."
          value={form.observaciones}
          onChange={(e) => setField("observaciones", e.target.value)}
          className="bg-white resize-none h-20"
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="bg-white">Cancelar</Button>
        <Button
          onClick={handleSave}
          disabled={saving || !canSave}
          className="bg-[#6BB68A] hover:bg-[#5aa377] text-white"
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}