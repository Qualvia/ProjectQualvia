import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, AlertCircle } from "lucide-react";

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

  const [producto, setProducto] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [proveedorManual, setProveedorManual] = useState("");
  const [modoManual, setModoManual] = useState(false);

  const [contieneAlergenos, setContieneAlergenos] = useState(false);
  const [alergenos, setAlergenos] = useState([]);
  const [resultado, setResultado] = useState(null); // "aceptado" | "rechazado"
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // Detalles aceptado
  const [lote, setLote] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [temperatura, setTemperatura] = useState("");
  const [estadoEnvase, setEstadoEnvase] = useState("");

  useEffect(() => {
    if (!currentBusiness) {
      setLoadingData(false);
      return;
    }
    base44.entities.Proveedor.filter({ business_id: currentBusiness.id })
      .then((data) => {
        setProveedores(data);
        if (data.length === 0) setModoManual(true);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error cargando proveedores:", err);
        setProveedores([]);
        setModoManual(true);
        setLoadingData(false);
      });
  }, [currentBusiness]);

  function toggleAlergeno(a) {
    setAlergenos((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  }

  const proveedorFinal = modoManual ? proveedorManual : proveedorSeleccionado;

  const canSave =
    producto.trim() &&
    proveedorFinal.trim() &&
    resultado &&
    (resultado !== "rechazado" || motivoRechazo.trim());

  async function handleGuardar() {
    if (!canSave) return;
    setSaving(true);
    try {
      await base44.entities.RegistroRecepcion.create({
        business_id: currentBusiness.id,
        producto: producto.trim(),
        proveedor: proveedorFinal.trim(),
        resultado,
        contiene_alergenos: contieneAlergenos,
        alergenos: contieneAlergenos ? alergenos : [],
        lote: lote || undefined,
        fecha_caducidad: fechaCaducidad || undefined,
        temperatura: temperatura !== "" ? Number(temperatura) : undefined,
        estado_envase: estadoEnvase || undefined,
        observaciones: resultado === "rechazado" ? motivoRechazo : undefined,
        fecha: new Date().toISOString(),
      });
      onSaved();
    } catch (err) {
      console.error("Error guardando recepción:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loadingData) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-2xl p-5 space-y-4">

      {/* Producto + Proveedor en la misma línea */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block font-semibold text-[#0A3E47] text-sm">Producto *</Label>
          <Input
            placeholder="Nombre del producto"
            value={producto}
            onChange={(e) => setProducto(e.target.value)}
            className="bg-white"
          />
        </div>
        <div>
          <Label className="mb-1.5 block font-semibold text-[#0A3E47] text-sm">Proveedor *</Label>
          {!modoManual && proveedores.length > 0 ? (
            <select
              value={proveedorSeleccionado}
              onChange={(e) => {
                if (e.target.value === "__manual__") {
                  setModoManual(true);
                  setProveedorSeleccionado("");
                } else {
                  setProveedorSeleccionado(e.target.value);
                }
              }}
              className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona...</option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
              <option value="__manual__">✏ Escribir manualmente</option>
            </select>
          ) : (
            <div className="flex gap-1">
              <Input
                placeholder="Nombre del proveedor"
                value={proveedorManual}
                onChange={(e) => setProveedorManual(e.target.value)}
                className="bg-white"
              />
              {proveedores.length > 0 && (
                <button
                  onClick={() => { setModoManual(false); setProveedorManual(""); }}
                  className="text-xs text-muted-foreground hover:text-foreground px-2 shrink-0"
                  title="Volver a lista"
                >↩</button>
              )}
            </div>
          )}
        </div>
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
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ALERGENOS.map((a) => (
              <button
                key={a}
                onClick={() => toggleAlergeno(a)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors
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
        <p className="font-semibold text-[#0A3E47] text-sm mb-2">Resultado *</p>
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

      {/* Motivo rechazo */}
      {resultado === "rechazado" && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-2">
          <p className="flex items-center gap-2 text-red-600 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            Motivo del rechazo / Incidencia
          </p>
          <Textarea
            placeholder="Describe por qué se rechaza el producto (temperatura incorrecta, envase dañado, caducado...)"
            value={motivoRechazo}
            onChange={(e) => setMotivoRechazo(e.target.value)}
            className="bg-white border-red-300 resize-none h-24 focus-visible:ring-red-400"
          />
        </div>
      )}

      {/* Detalles adicionales si aceptado */}
      {resultado === "aceptado" && (
        <div className="bg-white rounded-xl border border-border p-4 space-y-3">
          <p className="font-semibold text-[#0A3E47] text-sm">Detalles del producto</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1 block text-xs">Lote</Label>
              <Input placeholder="Nº de lote" value={lote} onChange={(e) => setLote(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Fecha de caducidad</Label>
              <Input type="date" value={fechaCaducidad} onChange={(e) => setFechaCaducidad(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Temperatura (°C)</Label>
              <Input type="number" placeholder="Ej: 4" value={temperatura} onChange={(e) => setTemperatura(e.target.value)} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Estado del envase</Label>
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

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-white">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={saving || !canSave}
          className="flex-1 bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Guardar recepción
        </Button>
      </div>
    </div>
  );
}