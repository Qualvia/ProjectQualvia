import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  ArrowLeft, Upload, FileText, Image, File, Trash2, Search, Loader2
} from "lucide-react";

function getFileIcon(tipo) {
  if (tipo === "imagen") return <Image className="w-6 h-6 text-blue-500" />;
  if (tipo === "documento") return <FileText className="w-6 h-6 text-[#0A3E47]" />;
  return <File className="w-6 h-6 text-muted-foreground" />;
}

function getFileType(file) {
  if (file.type.startsWith("image/")) return "imagen";
  if (
    file.type === "application/pdf" ||
    file.type.includes("word") ||
    file.type.includes("excel") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("presentation") ||
    file.type === "text/plain"
  ) return "documento";
  return "otro";
}

function formatSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VistaArchivos({ carpeta, onVolver }) {
  const { currentBusiness, user } = useBusiness();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const fileInputRef = useRef(null);

  async function cargarArchivos() {
    if (!currentBusiness || !carpeta) return;
    setLoading(true);
    const data = await base44.entities.RecursoArchivo.filter(
      { business_id: currentBusiness.id, carpeta_id: carpeta.id },
      "-created_date"
    );
    setArchivos(data);
    setLoading(false);
  }

  useEffect(() => { cargarArchivos(); }, [carpeta, currentBusiness]);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.RecursoArchivo.create({
        user_id: user.id,
        business_id: currentBusiness.id,
        carpeta_id: carpeta.id,
        nombre: file.name,
        file_url,
        tipo: getFileType(file),
        tamano: file.size,
      });
    }
    setUploading(false);
    cargarArchivos();
    e.target.value = "";
  }

  async function handleDelete(archivo) {
    await base44.entities.RecursoArchivo.delete(archivo.id);
    setArchivos((prev) => prev.filter((a) => a.id !== archivo.id));
  }

  const filtrados = archivos.filter((a) =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar archivos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-input text-sm focus:outline-none focus:ring-1 focus:ring-ring bg-white"
          />
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors shrink-0 disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Subir Archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Breadcrumb */}
      <button
        onClick={onVolver}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a carpetas / <span className="font-medium text-foreground">{carpeta.nombre}</span>
      </button>

      {/* Lista archivos */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <FileText className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="font-semibold text-foreground">Esta carpeta está vacía</p>
            <p className="text-sm text-muted-foreground">Sube documentos para empezar</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtrados.map((archivo) => (
              <div key={archivo.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {getFileIcon(archivo.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={archivo.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm text-[#0A3E47] hover:underline truncate block"
                  >
                    {archivo.nombre}
                  </a>
                  {archivo.tamano > 0 && (
                    <p className="text-xs text-muted-foreground">{formatSize(archivo.tamano)}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(archivo)}
                  className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}