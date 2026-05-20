import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Loader2 } from "lucide-react";

const OPERACIONES = ["Congelación", "Descongelación"];

export default function NuevoRegistroCongelacion({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const [equipos, setEquipos] = useState([]);
  const [form, setForm] = useState({
    producto: "",
    operacion: "Congelación",
    equipo_id: "",
    equipo_nombre: "",
    temperatura_inicial: "",
    temperatura_final: "",
    consumir_antes_de: "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.EquipoTemperatura.filter({ business_id: currentBusiness.id }).then(setEquipos);
  }, [currentBusiness]);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEquipoChange(e) {
    const eq = equipos.find((eq) => eq.id === e.target.value);
    setForm((prev) => ({
      ...prev,
      equipo_id: eq ? eq.id : "",
      equipo_nombre: eq ? eq.nombre : "",
    }));
  }

  async function handleGuardar(e, imprimir = false) {
    e.preventDefault();
    if (!form.producto.trim()) return;
    setLoading(true);
    await base44.entities.RegistroCongelacion.create({
      ...form,
      temperatura_inicial: form.temperatura_inicial !== "" ? parseFloat(form.temperatura_inicial) : undefined,
      temperatura_final: form.temperatura_final !== "" ? parseFloat(form.temperatura_final) : undefined,
      user_id: user.id,
      business_id: currentBusiness.id,
      fecha: new Date().toISOString(),
    });
    setLoading(false);
    if (imprimir) handleImprimir();
    onSaved();
  }

  function handleImprimir() {
    const etiqueta = `
      PRODUCTO: ${form.producto}
      OPERACIÓN: ${form.operacion}
      ${form.equipo_nombre ? `EQUIPO: ${form.equipo_nombre}` : ""}
      ${form.temperatura_inicial !== "" ? `TEMP. INICIAL: ${form.temperatura_inicial}°C` : ""}
      ${form.temperatura_final !== "" ? `TEMP. FINAL: ${form.temperatura_final}°C` : ""}
      ${form.consumir_antes_de ? `CONSUMIR ANTES DE: ${form.consumir_antes_de}` : ""}
      FECHA: ${new Date().toLocaleDateString("es-ES")}
    `;
    const win = window.open("", "_blank", "width=400,height=300");
    win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px">${etiqueta}</pre>`);
    win.document.close();
    win.print();
  }

  return (
    <div className="bg-secondary rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Producto *</label>
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.producto}
            onChange={(e) => set("producto", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Operación *</label>
          <select
            value={form.operacion}
            onChange={(e) => set("operacion", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {OPERACIONES.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Equipo</label>
        <select
          value={form.equipo_id}
          onChange={handleEquipoChange}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">Selecciona un equipo</option>
          {equipos.map((eq) => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Temperatura inicial (°C)</label>
          <input
            type="number"
            placeholder="Ej: 20"
            value={form.temperatura_inicial}
            onChange={(e) => set("temperatura_inicial", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Temperatura final (°C)</label>
          <input
            type="number"
            placeholder="Ej: -18"
            value={form.temperatura_final}
            onChange={(e) => set("temperatura_final", e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Consumir antes de</label>
        <input
          type="date"
          value={form.consumir_antes_de}
          onChange={(e) => set("consumir_antes_de", e.target.value)}
          className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Observaciones</label>
        <textarea
          placeholder="Observaciones adicionales..."
          value={form.observaciones}
          onChange={(e) => set("observaciones", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={loading || !form.producto.trim()}
          onClick={(e) => handleGuardar(e, false)}
          className="px-5 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar registro
        </button>
        <button
          type="button"
          disabled={loading || !form.producto.trim()}
          onClick={(e) => handleGuardar(e, true)}
          className="px-5 py-2.5 rounded-xl bg-[#0A3E47] hover:bg-[#0A3E47]/90 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Guardar e Imprimir Etiqueta
        </button>
      </div>
    </div>
  );
}