import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash2, Upload, Link2, Info } from "lucide-react";
import { format } from "date-fns";

function generarCodigoLote(contador = 1) {
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");
  const seq = String(contador).padStart(3, "0");
  return `LT-${yyyy}${mm}${dd}-${seq}`;
}

export default function NuevoRegistroLote({ onCancel, onSaved }) {
  const { currentBusiness, user } = useBusiness();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recepciones, setRecepciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // Form fields
  const today = format(new Date(), "yyyy-MM-dd");
  const [codigoLote, setCodigoLote] = useState("");
  const [productoElaborado, setProductoElaborado] = useState("");
  const [fechaElaboracion, setFechaElaboracion] = useState(today);
  const [fechaCaducidad, setFechaCaducidad] = useState(today);
  const [cantidad, setCantidad] = useState("");
  const [zonaAlmacenamiento, setZonaAlmacenamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [documentoUrl, setDocumentoUrl] = useState("");

  // Lotes origen
  const [lotesOrigen, setLotesOrigen] = useState([]);
  const [buscarDesde, setBuscarDesde] = useState(today);
  const [buscarHasta, setBuscarHasta] = useState(today);
  const [recepcionSeleccionada, setRecepcionSeleccionada] = useState("");
  const [origenManual, setOrigenManual] = useState({ codigo_lote: "", producto: "", proveedor: "", cantidad_utilizada: "" });

  useEffect(() => {
    if (!currentBusiness) { setLoadingData(false); return; }
    Promise.all([
      base44.entities.RegistroRecepcion.filter({ business_id: currentBusiness.id }, "-fecha", 500),
      base44.entities.EquipoTemperatura.filter({ business_id: currentBusiness.id }),
    ]).then(([recs, eqs]) => {
      setRecepciones(recs);
      setEquipos(eqs);
      setLoadingData(false);
    }).catch(() => setLoadingData(false));

    // Auto-generar código
    base44.entities.RegistroLote.filter({ business_id: currentBusiness.id }, "-created_date", 500)
      .then((lotes) => {
        const hoy = format(new Date(), "yyyy-MM-dd");
        const lotesHoy = lotes.filter((l) => l.created_date && l.created_date.startsWith(hoy));
        setCodigoLote(generarCodigoLote(lotesHoy.length + 1));
      })
      .catch(() => setCodigoLote(generarCodigoLote(1)));
  }, [currentBusiness]);

  // Filtrar recepciones por rango de fechas
  const recepcionesFiltradas = recepciones.filter((r) => {
    if (!r.fecha) return false;
    const fecha = r.fecha.slice(0, 10);
    return fecha >= buscarDesde && fecha <= buscarHasta;
  });

  function handleSeleccionarRecepcion(val) {
    setRecepcionSeleccionada(val);
    if (!val) return;
    const rec = recepciones.find((r) => r.id === val);
    if (rec) {
      setOrigenManual({
        codigo_lote: rec.lote || "",
        producto: rec.producto || "",
        proveedor: rec.proveedor || "",
        cantidad_utilizada: "",
      });
    }
  }

  function handleAddOrigen() {
    if (!origenManual.producto.trim()) return;
    setLotesOrigen((prev) => [...prev, { ...origenManual }]);
    setOrigenManual({ codigo_lote: "", producto: "", proveedor: "", cantidad_utilizada: "" });
    setRecepcionSeleccionada("");
  }

  function handleRemoveOrigen(idx) {
    setLotesOrigen((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleDocumento(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setDocumentoUrl(file_url);
    setUploading(false);
  }

  async function handleSave() {
    if (!codigoLote.trim() || !productoElaborado.trim()) return;
    setSaving(true);
    await base44.entities.RegistroLote.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      codigo_lote: codigoLote.trim(),
      producto_elaborado: productoElaborado.trim(),
      fecha_elaboracion: fechaElaboracion || undefined,
      fecha_caducidad: fechaCaducidad || undefined,
      cantidad: cantidad || undefined,
      zona_almacenamiento: zonaAlmacenamiento || undefined,
      lotes_origen: lotesOrigen.length > 0 ? lotesOrigen : undefined,
      documento_url: documentoUrl || undefined,
      observaciones: observaciones || undefined,
    });
    setSaving(false);
    onSaved();
  }

  if (loadingData) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      {/* Form principal */}
      <div className="bg-secondary rounded-2xl p-6 space-y-5">
        {/* Código + Producto */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Label>Código de lote *</Label>
              <button
                type="button"
                onClick={() => setShowInfo((v) => !v)}
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${showInfo ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-500 hover:bg-blue-200"}`}
                title="¿Cómo crear el código de lote?"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
            {showInfo && (
              <div className="mb-2 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                <p className="text-blue-700">El código de lote es único y permite identificar y rastrear cada producción. Te recomendamos usar este formato:</p>
                <p className="font-mono text-[#6BB68A] bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs">LT–AAAAMMDD–XXX</p>
                <ul className="text-blue-700 space-y-0.5 text-xs">
                  <li>• <strong>LT:</strong> Prefijo (Lote)</li>
                  <li>• <strong>AAAAMMDD:</strong> Fecha de elaboración (ej: 20250124)</li>
                  <li>• <strong>XXX:</strong> Número secuencial del día (001, 002...)</li>
                </ul>
                <p className="text-blue-700 text-xs"><strong>Ejemplo:</strong> LT-20250124-001</p>
                <div className="border-t border-blue-200 pt-2">
                  <p className="flex items-center gap-1.5 font-semibold text-blue-800 text-xs"><Link2 className="w-3 h-3" /> Lotes de origen (Trazabilidad)</p>
                  <p className="text-blue-700 text-xs mt-1">Los <strong>lotes de origen</strong> son las materias primas utilizadas (harina, huevos, carne...). Vincúlalos abajo para saber exactamente qué ingredientes lleva cada lote final.</p>
                </div>
              </div>
            )}
            <Input
              placeholder="Ej: LT20250101-001"
              value={codigoLote}
              onChange={(e) => setCodigoLote(e.target.value)}
              className="bg-white font-mono"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Producto elaborado *</Label>
            <Input
              placeholder="Nombre del producto"
              value={productoElaborado}
              onChange={(e) => setProductoElaborado(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Fecha de elaboración</Label>
            <Input type="date" value={fechaElaboracion} onChange={(e) => setFechaElaboracion(e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block">Fecha de caducidad</Label>
            <Input type="date" value={fechaCaducidad} onChange={(e) => setFechaCaducidad(e.target.value)} className="bg-white" />
          </div>
        </div>

        {/* Cantidad + Zona */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block">Cantidad</Label>
            <Input placeholder="Ej: 50 kg, 100 unidades..." value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="bg-white" />
          </div>
          <div>
            <Label className="mb-1.5 block">Zona de almacenamiento</Label>
            <select
              value={zonaAlmacenamiento}
              onChange={(e) => setZonaAlmacenamiento(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Selecciona equipo/zona...</option>
              {equipos.map((eq) => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
              <option value="__manual__">Escribir manualmente...</option>
            </select>
            {zonaAlmacenamiento === "__manual__" && (
              <Input className="bg-white mt-2" placeholder="Nombre de la zona" onChange={(e) => setZonaAlmacenamiento(e.target.value)} />
            )}
          </div>
        </div>

        {/* Lotes de origen */}
        <div>
          <Label className="mb-2 block">Lotes de origen (materias primas)</Label>
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <p className="text-sm font-medium text-[#0A3E47]">Buscar materias primas recibidas entre fechas:</p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">De:</span>
              <Input type="date" value={buscarDesde} onChange={(e) => setBuscarDesde(e.target.value)} className="bg-white w-40" />
              <span className="text-sm text-muted-foreground">A:</span>
              <Input type="date" value={buscarHasta} onChange={(e) => setBuscarHasta(e.target.value)} className="bg-white w-40" />
            </div>
            <select
              value={recepcionSeleccionada}
              onChange={(e) => handleSeleccionarRecepcion(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Seleccionar materia prima recibida...</option>
              {recepcionesFiltradas.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.producto} — {r.proveedor} {r.lote ? `(Lote: ${r.lote})` : ""} — {r.fecha ? r.fecha.slice(0, 10) : ""}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Código de lote" value={origenManual.codigo_lote} onChange={(e) => setOrigenManual((p) => ({ ...p, codigo_lote: e.target.value }))} className="bg-white" />
              <Input placeholder="Producto/Materia prima" value={origenManual.producto} onChange={(e) => setOrigenManual((p) => ({ ...p, producto: e.target.value }))} className="bg-white" />
              <Input placeholder="Proveedor" value={origenManual.proveedor} onChange={(e) => setOrigenManual((p) => ({ ...p, proveedor: e.target.value }))} className="bg-white" />
              <div className="flex gap-2">
                <Input placeholder="Cantidad utilizada" value={origenManual.cantidad_utilizada} onChange={(e) => setOrigenManual((p) => ({ ...p, cantidad_utilizada: e.target.value }))} className="bg-white" />
                <Button onClick={handleAddOrigen} disabled={!origenManual.producto.trim()} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white shrink-0">
                  <Plus className="w-4 h-4 mr-1" /> Añadir
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de lotes añadidos */}
          {lotesOrigen.length > 0 && (
            <div className="mt-3 space-y-2">
              {lotesOrigen.map((l, i) => (
                <div key={i} className="bg-white rounded-xl border border-border px-4 py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{l.producto}</p>
                    <p className="text-xs text-muted-foreground">
                      {[l.codigo_lote && `Lote: ${l.codigo_lote}`, l.proveedor && `Proveedor: ${l.proveedor}`, l.cantidad_utilizada && `Cantidad: ${l.cantidad_utilizada}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <button onClick={() => handleRemoveOrigen(i)} className="text-destructive/60 hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documento adjunto */}
        <div>
          <Label className="mb-1.5 block">Documentos adjuntos (certificados, fichas técnicas, etc.)</Label>
          <label className="flex items-center justify-center gap-2 w-full h-12 rounded-xl border-2 border-dashed border-border bg-white hover:border-[#6BB68A] cursor-pointer transition-colors text-sm text-muted-foreground hover:text-[#6BB68A]">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {documentoUrl ? "Documento adjuntado ✓" : "Adjuntar documento"}
            <input type="file" className="hidden" onChange={handleDocumento} />
          </label>
        </div>

        {/* Observaciones */}
        <div>
          <Label className="mb-1.5 block">Observaciones</Label>
          <Textarea
            placeholder="Materias primas utilizadas, observaciones..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="bg-white resize-none h-20"
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="bg-white">Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !codigoLote.trim() || !productoElaborado.trim()}
            className="bg-[#6BB68A] hover:bg-[#5aa377] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Guardar lote
          </Button>
        </div>
      </div>
    </div>
  );
}