import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X } from "lucide-react";

const ALERGENOS = [
  "Gluten", "Crustáceos", "Huevos", "Pescado", "Cacahuetes", "Soja",
  "Leche", "Frutos de cáscara", "Apio", "Mostaza", "Sésamo",
  "Dióxido de azufre y sulfitos", "Altramuces", "Moluscos",
];

const ESTADOS_ENVASE = ["Correcto", "Dañado", "Deteriorado"];

export default function NuevoRegistroRecepcion({ onCancel, onSaved }) {
  const { currentBusiness } = useBusiness();
  const [proveedores, setProveedores] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [proveedor, setProveedor] = useState("");
  const [producto, setProducto] = useState("");
  const [contieneAlergenos, setContieneAlergenos] = useState(false);
  const [alergenos, setAlergenos] = useState([]);
  const [resultado, setResultado] = useState(null); // "aceptado" | "rechazado"
  const [lote, setLote] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [estadoEnvase, setEstadoEnvase] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.Proveedor.filter({ business_id: currentBusiness.id }).then((data) => {
      setProveedores(data);
      setLoadingData(false);
    });
  }, [currentBusiness]);

  function toggleAlergeno(a) {
    setAlergenos((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  async function handleGuardar() {
    if (!producto.trim() || !proveedor.trim() || !resultado) return;
    setSaving(true);
    await base44.entities.RegistroRecepcion.create({
      business_id: currentBusiness.id,
      producto: producto.trim(),
      proveedor: proveedor.trim(),
      resultado,
      contiene_alergenos: contieneAlergenos,
      alergenos: contieneAlergenos ? alergenos : [],
      lote: lote || undefined,
      fecha_caducidad: fechaCaducidad || undefined,
      temperatura: temperatura !== "" ? Number(temperatura) : undefined,
      estado_envase: estadoEnvase || undefined,
      observaciones: observaciones || undefined,
      fecha: new Date().toISOString(),
    });
    setSaving(false);
    onSaved();
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-2xl p-5 space-y-5">

      {/* Producto */}
      <div>
        <Label className="mb-1.5 block font-semibold text-[#0A3E47]">Producto *</Label>
        <Input
          placeholder="Nombre del producto recibido"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          className="bg-white"
        />
      </div>

      {/* Proveedor */}
      <div>
        <Label className="mb-1.5 block font-semibold text-[#0A3E47]">Proveedor *</Label>
        {proveedores.length > 0 ? (
          <select
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Selecciona un proveedor...</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.nombre}>{p.nombre}</option>
            ))}
            <option value="__manual__">Introducir manualmente</option>
          </select>
        ) : null}
        {(proveedor === "__manual__" || proveedores.length === 0) && (
          <Input
            placeholder="Nombre del proveedor"
            value={proveedor === "__manual__" ? "" : proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="bg-white mt-2"
          />
        )}
      </div>

      {/* Alérgenos */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={contieneAlergenos}
            onChange={(e) => { setContieneAlergenos(e.target.checked); if (!e.target.checked) setAlergenos([]); }}
            className="w-4 h-4 accent-[#6BB68A]"
          />
          <span className="font-semibold text-[#0A3E47] text-sm">¿Contiene alérgenos?</span>
        </label>
        {contieneAlergenos && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ALERGENOS.map((a) => (
              <button
                key={a}
                onClick={() => toggleAlergeno(a)}
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors
                  ${alergenos.includes(a)
                    ? "bg-yellow-400 border-yellow-400 text-white"
                    : "bg-white border-border text-foreground hover:border-yellow-400"}`}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Resultado */}
      <div>
        <p className="font-semibold text-[#0A3E47] mb-2">Resultado *</p>
        <div className="flex gap-3">
          <button
            onClick={() => setResultado("aceptado")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all
              ${resultado === "aceptado"
                ? "border-[#6BB68A] bg-[#6BB68A] text-white"
                : "border-border bg-white text-foreground hover:border-[#6BB68A]"}`}
          >
            <Check className="w-4 h-4" />
            Aceptado
          </button>
          <button
            onClick={() => setResultado("rechazado")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all
              ${resultado === "rechazado"
                ? "border-red-500 bg-red-500 text-white"
                : "border-border bg-white text-foreground hover:border-red-400"}`}
          >
            <X className="w-4 h-4" />
            Rechazado
          </button>
        </div>
      </div>

      {/* Detalles adicionales si aceptado */}
      {resultado === "aceptado" && (
        <div className="bg-white rounded-xl border border-border p-4 space-y-4">
          <p className="font-semibold text-[#0A3E47] text-sm">Detalles del producto</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block text-sm">Lote</Label>
              <Input placeholder="Nº de lote" value={lote} onChange={(e) => setLote(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Fecha de caducidad</Label>
              <Input type="date" value={fechaCaducidad} onChange={(e) => setFechaCaducidad(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Temperatura (°C)</Label>
              <Input type="number" placeholder="Ej: 4" value={temperatura} onChange={(e) => setTemperatura(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Estado del envase</Label>
              <select
                value={estadoEnvase}
                onChange={(e) => setEstadoEnvase(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Seleccionar...</option>
                {ESTADOS_ENVASE.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Observaciones */}
      <div>
        <Label className="mb-1.5 block font-semibold text-[#0A3E47]">Observaciones</Label>
        <Textarea
          placeholder="Notas adicionales..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="bg-white resize-none h-20"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-white">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={saving || !producto.trim() || !proveedor.trim() || !resultado || proveedor === "__manual__"}
          className="flex-1 bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Guardar recepción
        </Button>
      </div>
    </div>
  );
}