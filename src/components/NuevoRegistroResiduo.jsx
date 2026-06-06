import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Loader2 } from "lucide-react";
import { marcarTareaCompletada } from "@/utils/marcarTareaCompletada";
import { registrarActividad } from "@/utils/registrarActividad";

const TIPOS_RESIDUO = ["Orgánico", "Envases y plásticos", "Papel y cartón", "Vidrio", "Aceite usado", "Subproducto animal", "Otro"];
const UNIDADES = ["kg", "litros", "unidades", "m³"];
const GESTIONES = ["Recogida por gestor autorizado", "Entrega en punto limpio", "Reutilización interna", "Compostaje", "Otro"];
const GESTOR_TIPOS = ["Empresa / Gestor autorizado", "Interno"];

export default function NuevoRegistroResiduo({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const { nombreRegistrador } = useUsuarioInterno();
  const [gestorNombre, setGestorNombre] = useState("");
  const [form, setForm] = useState({
    tipo_residuo: "Orgánico",
    descripcion: "",
    cantidad: "",
    unidad: "kg",
    gestion_realizada: "",
    gestor_tipo: "Empresa / Gestor autorizado",
    gestor_nombre: "",
    documento_acreditativo: "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.GestorResiduos.filter({ business_id: currentBusiness.id })
      .then((data) => { if (data.length > 0) setGestorNombre(data[0].nombre_empresa); });
  }, [currentBusiness]);

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function handleGuardar() {
    if (!form.tipo_residuo) return;
    setLoading(true);
    await base44.entities.RegistroResiduo.create({
      ...form,
      cantidad: form.cantidad !== "" ? parseFloat(form.cantidad) : undefined,
      gestor_nombre: form.gestor_tipo === "Empresa / Gestor autorizado" ? (form.gestor_nombre || gestorNombre) : form.gestor_nombre,
      user_id: user.id,
      business_id: currentBusiness.id,
      registrado_por: nombreRegistrador || user.full_name || user.email,
      fecha: new Date().toISOString(),
    });
    await marcarTareaCompletada("Residuos", user.id, currentBusiness.id);
    registrarActividad({
      user_id: user.id,
      business_id: currentBusiness.id,
      tipo: "residuos",
      quien: nombreRegistrador || user.full_name || user.email,
      accion: `gestión de residuos · ${form.tipo_residuo}`,
      detalle: form.cantidad !== "" ? `${form.cantidad} ${form.unidad}` : null,
    });
    setLoading(false);
    onSaved();
  }

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Tipo de residuo *</label>
          <select value={form.tipo_residuo} onChange={(e) => set("tipo_residuo", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {TIPOS_RESIDUO.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Descripción</label>
          <input type="text" placeholder="Descripción del residuo" value={form.descripcion}
            onChange={(e) => set("descripcion", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Cantidad</label>
          <input type="number" placeholder="0" min="0" value={form.cantidad}
            onChange={(e) => set("cantidad", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Unidad</label>
          <select value={form.unidad} onChange={(e) => set("unidad", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Gestión realizada</label>
          <select value={form.gestion_realizada} onChange={(e) => set("gestion_realizada", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="">Selecciona gestión</option>
            {GESTIONES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Gestor autorizado</label>
          <select value={form.gestor_tipo} onChange={(e) => set("gestor_tipo", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
            {GESTOR_TIPOS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <input type="text"
            placeholder={form.gestor_tipo === "Empresa / Gestor autorizado" ? (gestorNombre || "Nombre del gestor") : "Nombre del gestor"}
            value={form.gestor_nombre}
            onChange={(e) => set("gestor_nombre", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring mt-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Documento acreditativo</label>
        <input type="text" placeholder="Nº albarán o documento" value={form.documento_acreditativo}
          onChange={(e) => set("documento_acreditativo", e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Observaciones</label>
        <textarea placeholder="Observaciones adicionales..." value={form.observaciones}
          onChange={(e) => set("observaciones", e.target.value)} rows={3}
          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
          Cancelar
        </button>
        <button type="button" disabled={loading || !form.tipo_residuo} onClick={handleGuardar}
          className="px-5 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar registro
        </button>
      </div>
    </div>
  );
}