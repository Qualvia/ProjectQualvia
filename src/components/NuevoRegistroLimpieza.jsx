import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, MessageSquare, Camera, Loader2, Ban } from "lucide-react";

function ZonaRow({ zona, estado, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [comentario, setComentario] = useState("");
  const [foto, setFoto] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);

  function setEstado(val) {
    const next = estado === val ? null : val;
    onChange({ estado: next, motivo: "", comentario, foto });
    if (next === "satisfactorio" || next === "no_aplica") {
      setExpanded(true);
    } else if (next === "no_limpiado") {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  }

  function handleMotivo(val) {
    setMotivo(val);
    onChange({ estado, motivo: val, comentario, foto });
  }

  function handleComentario(val) {
    setComentario(val);
    onChange({ estado, motivo, comentario: val, foto });
  }

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFoto(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFoto(file_url);
    onChange({ estado, motivo, comentario, foto: file_url });
    setUploadingFoto(false);
  }

  const isSatisfactorio = estado === "satisfactorio";
  const isNoLimpiado = estado === "no_limpiado";
  const isNoAplica = estado === "no_aplica";

  return (
    <div className={`bg-white rounded-2xl border transition-all ${isNoLimpiado ? "border-red-300" : "border-border"}`}>
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-semibold text-foreground">{zona.nombre}</span>
        <div className="flex items-center gap-2">
          {/* Correcto */}
          <button
            onClick={() => setEstado("satisfactorio")}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
              ${isSatisfactorio ? "border-[#6BB68A] bg-[#6BB68A] text-white" : "border-muted-foreground/30 text-muted-foreground hover:border-[#6BB68A]"}`}
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
          </button>
          {/* No limpiado */}
          <button
            onClick={() => setEstado("no_limpiado")}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
              ${isNoLimpiado ? "border-red-500 bg-red-500 text-white" : "border-muted-foreground/30 text-muted-foreground hover:border-red-400"}`}
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <span className="text-muted-foreground/40">|</span>
          {/* Comentario / expandir */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all
              ${expanded ? "border-primary bg-primary text-white" : "border-muted-foreground/30 text-muted-foreground hover:border-primary"}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel expandido */}
      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-border/40 pt-3">
          {isNoLimpiado && (
            <div className="flex items-center gap-2 border border-red-300 rounded-xl px-4 py-2.5 bg-red-50">
              <span className="text-red-500 text-sm">⚠</span>
              <input
                type="text"
                placeholder="¿Por qué no se ha limpiado?"
                value={motivo}
                onChange={(e) => handleMotivo(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-red-400 focus:outline-none"
              />
            </div>
          )}
          {(isSatisfactorio || isNoAplica) && (
            <button
              onClick={() => { const next = isNoAplica ? "satisfactorio" : "no_aplica"; setEstado(next); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors
                ${isNoAplica ? "bg-muted border-border text-muted-foreground" : "bg-white border-border text-muted-foreground hover:bg-muted"}`}
            >
              <Ban className="w-3.5 h-3.5" />
              No aplica hoy
            </button>
          )}
          <input
            type="text"
            placeholder="Añadir comentario o nota para esta zona..."
            value={comentario}
            onChange={(e) => handleComentario(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <label className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground cursor-pointer hover:bg-muted transition-colors">
            {uploadingFoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {foto ? "Foto añadida ✓" : "Añadir foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </label>
        </div>
      )}
    </div>
  );
}

export default function NuevoRegistroLimpieza({ onCancel, onSaved }) {
  const { currentBusiness } = useBusiness();
  const [zonas, setZonas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [zonasEstado, setZonasEstado] = useState({});
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    Promise.all([
      base44.entities.ZonaLimpieza.filter({ business_id: currentBusiness.id }),
      base44.entities.ProductoLimpieza.filter({ business_id: currentBusiness.id }),
    ]).then(([z, p]) => {
      setZonas(z);
      setProductos(p);
      setLoadingData(false);
    });
  }, [currentBusiness]);

  function handleZonaChange(zonaId, data) {
    setZonasEstado((prev) => ({ ...prev, [zonaId]: data }));
  }

  function toggleProducto(nombre) {
    setProductosSeleccionados((prev) =>
      prev.includes(nombre) ? prev.filter((p) => p !== nombre) : [...prev, nombre]
    );
  }

  async function handleGuardar() {
    const registros = zonas
      .filter((z) => zonasEstado[z.id]?.estado)
      .map((z) => ({
        business_id: currentBusiness.id,
        zona_id: z.id,
        zona_nombre: z.nombre,
        estado: zonasEstado[z.id].estado,
        motivo_no_limpiado: zonasEstado[z.id].motivo || "",
        comentario: zonasEstado[z.id].comentario || "",
        foto_url: zonasEstado[z.id].foto || "",
        productos_usados: productosSeleccionados,
        observaciones_generales: observaciones,
        fecha: new Date().toISOString(),
      }));

    if (registros.length === 0) return;
    setSaving(true);
    await base44.entities.RegistroLimpieza.bulkCreate(registros);
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

  if (zonas.length === 0) {
    return (
      <div className="bg-secondary rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No hay zonas de limpieza configuradas. Añádelas desde "Gestionar equipos/zonas".
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-2xl p-5 space-y-5">
      {/* Zonas */}
      <div>
        <p className="font-semibold text-[#0A3E47] mb-3">Zonas *</p>
        <div className="space-y-3">
          {zonas.map((zona) => (
            <ZonaRow
              key={zona.id}
              zona={zona}
              estado={zonasEstado[zona.id]?.estado || null}
              onChange={(data) => handleZonaChange(zona.id, data)}
            />
          ))}
        </div>
      </div>

      {/* Productos */}
      {productos.length > 0 && (
        <div>
          <p className="font-semibold text-[#0A3E47] mb-3">Productos de limpieza</p>
          <div className="bg-white rounded-2xl border border-border px-5 py-4 space-y-3">
            {productos.map((p) => (
              <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productosSeleccionados.includes(p.nombre)}
                  onChange={() => toggleProducto(p.nombre)}
                  className="w-4 h-4 rounded border-border accent-[#6BB68A]"
                />
                <span className="text-sm text-foreground">{p.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Observaciones generales */}
      <div>
        <p className="font-semibold text-[#0A3E47] mb-3">Observaciones generales</p>
        <Textarea
          placeholder="Observaciones adicionales..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="bg-white resize-none h-24"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          disabled={saving || !Object.values(zonasEstado).some((z) => z?.estado)}
          className="flex-1 bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Guardar registro
        </Button>
      </div>
    </div>
  );
}