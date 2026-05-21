import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Library, Plus, Search, Loader2 } from "lucide-react";
import CarpetaItem from "./recursos/CarpetaItem";
import VistaArchivos from "./recursos/VistaArchivos";

const CARPETAS_DEFAULT = [
  "Instrucciones de trabajo",
  "Guías rápidas",
  "Estándares",
  "Fichas técnicas",
  "Fichas de seguridad",
  "Recetas",
];

export default function TabRecursos() {
  const { currentBusiness, user } = useBusiness();
  const [carpetas, setCarpetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carpetaAbierta, setCarpetaAbierta] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Dialogs
  const [showNuevaCarpeta, setShowNuevaCarpeta] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [renombrando, setRenombrando] = useState(null); // carpeta obj
  const [nombreRenombre, setNombreRenombre] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null); // carpeta obj

  async function cargarCarpetas() {
    if (!currentBusiness) return;
    setLoading(true);
    let data = await base44.entities.RecursoCarpeta.filter(
      { business_id: currentBusiness.id },
      "orden"
    );
    // Si no hay carpetas, crear las predefinidas
    if (data.length === 0) {
      const creadas = [];
      for (let i = 0; i < CARPETAS_DEFAULT.length; i++) {
        const c = await base44.entities.RecursoCarpeta.create({
          user_id: user.id,
          business_id: currentBusiness.id,
          nombre: CARPETAS_DEFAULT[i],
          orden: i,
        });
        creadas.push(c);
      }
      data = creadas;
    }
    setCarpetas(data);
    setLoading(false);
  }

  useEffect(() => {
    cargarCarpetas();
    setCarpetaAbierta(null);
  }, [currentBusiness]);

  async function handleCrearCarpeta() {
    if (!nombreNueva.trim()) return;
    const maxOrden = carpetas.length > 0 ? Math.max(...carpetas.map((c) => c.orden || 0)) + 1 : 0;
    const nueva = await base44.entities.RecursoCarpeta.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      nombre: nombreNueva.trim(),
      orden: maxOrden,
    });
    setCarpetas((prev) => [...prev, nueva]);
    setNombreNueva("");
    setShowNuevaCarpeta(false);
  }

  async function handleRenombrar() {
    if (!nombreRenombre.trim() || !renombrando) return;
    await base44.entities.RecursoCarpeta.update(renombrando.id, { nombre: nombreRenombre.trim() });
    setCarpetas((prev) =>
      prev.map((c) => (c.id === renombrando.id ? { ...c, nombre: nombreRenombre.trim() } : c))
    );
    setRenombrando(null);
    setNombreRenombre("");
  }

  async function handleEliminar(carpeta) {
    // Borrar archivos de la carpeta primero
    const archivos = await base44.entities.RecursoArchivo.filter({ carpeta_id: carpeta.id });
    for (const a of archivos) await base44.entities.RecursoArchivo.delete(a.id);
    await base44.entities.RecursoCarpeta.delete(carpeta.id);
    setCarpetas((prev) => prev.filter((c) => c.id !== carpeta.id));
    setConfirmDelete(null);
    if (carpetaAbierta?.id === carpeta.id) setCarpetaAbierta(null);
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;
    const items = Array.from(carpetas);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    // Actualizar orden local inmediatamente
    const updated = items.map((c, i) => ({ ...c, orden: i }));
    setCarpetas(updated);
    // Persistir nuevo orden
    for (const c of updated) {
      await base44.entities.RecursoCarpeta.update(c.id, { orden: c.orden });
    }
  }

  const filtradas = carpetas.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (carpetaAbierta) {
    return (
      <div className="space-y-5">
        {/* Banner */}
        <BannerRecursos />
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Library className="w-5 h-5 text-[#0A3E47]" />
            <span className="font-semibold text-[#0A3E47] text-lg">Biblioteca de Recursos</span>
          </div>
          <VistaArchivos carpeta={carpetaAbierta} onVolver={() => setCarpetaAbierta(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <BannerRecursos />

      {/* Biblioteca */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-5">
          <Library className="w-5 h-5 text-[#0A3E47]" />
          <span className="font-semibold text-[#0A3E47] text-lg">Biblioteca de Recursos</span>
        </div>

        {/* Barra búsqueda + nueva carpeta */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar carpetas..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-input text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => setShowNuevaCarpeta(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Carpeta
          </button>
        </div>

        {/* Lista carpetas con DnD */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="carpetas">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {filtradas.map((carpeta, index) => (
                    <Draggable key={carpeta.id} draggableId={carpeta.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={snapshot.isDragging ? "opacity-80 shadow-lg" : ""}
                        >
                          <CarpetaItem
                            carpeta={carpeta}
                            onOpen={setCarpetaAbierta}
                            onRename={(c) => { setRenombrando(c); setNombreRenombre(c.nombre); }}
                            onDelete={(c) => setConfirmDelete(c)}
                            dragHandleProps={provided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {!loading && filtradas.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No hay carpetas.</p>
        )}
      </div>

      {/* Modal nueva carpeta */}
      {showNuevaCarpeta && (
        <ModalInput
          titulo="Nueva carpeta"
          placeholder="Nombre de la carpeta"
          value={nombreNueva}
          onChange={setNombreNueva}
          onConfirm={handleCrearCarpeta}
          onCancel={() => { setShowNuevaCarpeta(false); setNombreNueva(""); }}
          confirmLabel="Crear"
        />
      )}

      {/* Modal renombrar */}
      {renombrando && (
        <ModalInput
          titulo="Editar nombre"
          placeholder="Nuevo nombre"
          value={nombreRenombre}
          onChange={setNombreRenombre}
          onConfirm={handleRenombrar}
          onCancel={() => { setRenombrando(null); setNombreRenombre(""); }}
          confirmLabel="Guardar"
        />
      )}

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <p className="font-bold text-foreground text-lg mb-2">¿Eliminar carpeta?</p>
            <p className="text-sm text-muted-foreground mb-5">
              Se eliminarán todos los archivos dentro de <span className="font-semibold">"{confirmDelete.nombre}"</span>. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BannerRecursos() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A3E47] to-[#6BB68A] p-6 relative">
      <div className="absolute right-6 top-4 opacity-10">
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
          <path d="M80 10 L150 110 L10 110 Z" fill="white" />
        </svg>
      </div>
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <Library className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-lg mb-1">Tu Biblioteca Digital</p>
          <p className="text-white/85 text-sm leading-relaxed">
            Centraliza toda tu documentación operativa. Sube y organiza fichas técnicas, guías rápidas,
            normativas y procedimientos internos para tenerlos siempre accesibles y actualizados.
          </p>
        </div>
      </div>
    </div>
  );
}

function ModalInput({ titulo, placeholder, value, onChange, onConfirm, onCancel, confirmLabel }) {
  function handleKey(e) {
    if (e.key === "Enter") onConfirm();
    if (e.key === "Escape") onCancel();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <p className="font-bold text-foreground text-lg mb-4">{titulo}</p>
        <input
          autoFocus
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          className="w-full h-10 rounded-xl border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!value.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#0A3E47] hover:bg-[#0d4f5c] text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}