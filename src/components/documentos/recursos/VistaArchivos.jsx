import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  ArrowLeft, Upload, FileText, Image, File, Trash2, Search, Loader2,
  LayoutList, LayoutGrid
} from "lucide-react";
import { format } from "date-fns";

function getFileIcon(tipo, large = false) {
  const cls = large ? "w-8 h-8" : "w-6 h-6";
  if (tipo === "imagen") return <Image className={`${cls} text-blue-500`} />;
  if (tipo === "documento") return <FileText className={`${cls} text-[#0A3E47]`} />;
  return <File className={`${cls} text-muted-foreground`} />;
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

function formatDate(dateStr) {
  if (!dateStr) return "";
  return format(new Date(dateStr), "d/M/yyyy");
}

// Vista Lista (original)
function ArchivoLista({ archivo, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/40 transition-colors group">
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
        <p className="text-xs text-muted-foreground">
          {[formatSize(archivo.tamano), formatDate(archivo.created_date)].filter(Boolean).join(" · ")}
        </p>
      </div>
      <button
        onClick={() => onDelete(archivo)}
        className="opacity-0 group-hover:opacity-100 text-destructive/60 hover:text-destructive transition-all p-1.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Vista Grid (previsualización)
function ArchivoGrid({ archivo, onDelete }) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden group relative">
      {/* Previsualización */}
      <a href={archivo.file_url} target="_blank" rel="noopener noreferrer">
        {archivo.tipo === "imagen" ? (
          <div className="w-full aspect-video bg-muted overflow-hidden">
            <img
              src={archivo.file_url}
              alt={archivo.nombre}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-secondary/60 flex items-center justify-center">
            {getFileIcon(archivo.tipo, true)}
          </div>
        )}
      </a>
      {/* Info */}
      <div className="px-3 py-2.5">
        <a
          href={archivo.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-sm text-[#0A3E47] hover:underline line-clamp-2 leading-snug block"
        >
          {archivo.nombre}
        </a>
        <p className="text-xs text-muted-foreground mt-0.5">
          {[formatSize(archivo.tamano), formatDate(archivo.created_date)].filter(Boolean).join(" · ")}
        </p>
      </div>
      {/* Eliminar */}
      <button
        onClick={() => onDelete(archivo)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg bg-white/90 text-destructive/70 hover:text-destructive shadow transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function VistaArchivos({ carpeta, onVolver }) {
  const { currentBusiness, user } = useBusiness();
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [vistaGrid, setVistaGrid] = useState(false);
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
      <div className="flex items-center gap-2">
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

        {/* Toggle vista */}
        <div className="flex rounded-xl border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setVistaGrid(false)}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${!vistaGrid ? "bg-[#0A3E47] text-white" : "bg-white text-muted-foreground hover:bg-secondary"}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setVistaGrid(true)}
            className={`w-10 h-10 flex items-center justify-center transition-colors ${vistaGrid ? "bg-[#0A3E47] text-white" : "bg-white text-muted-foreground hover:bg-secondary"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
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

      {/* Contenido */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-border flex justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center py-14 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="font-semibold text-foreground">Esta carpeta está vacía</p>
          <p className="text-sm text-muted-foreground">Sube documentos para empezar</p>
        </div>
      ) : vistaGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtrados.map((archivo) => (
            <ArchivoGrid key={archivo.id} archivo={archivo} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {filtrados.map((archivo) => (
            <ArchivoLista key={archivo.id} archivo={archivo} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}