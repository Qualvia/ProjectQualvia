import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Plus, Play, MoreVertical, Pencil, Trash2, Loader2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChecklistFormDialog from "./ChecklistFormDialog";
import EjecutarChecklist from "./EjecutarChecklist";

const PREDEFINIDOS = [
  {
    nombre: "Apertura del local",
    descripcion: "Checklist estándar de apertura",
    items: [
      { texto: "Revisar el estado general del local al abrir" },
      { texto: "Encender la maquinaria de cocina y verificar su funcionamiento" },
      { texto: "Registrar la temperatura de cámaras y equipos de frío" },
      { texto: "Verificar stock mínimo de productos perecederos" },
      { texto: "Comprobar limpieza de superficies de trabajo" },
      { texto: "Revisar fechas de caducidad de productos abiertos" },
      { texto: "Preparar mise en place para el servicio" },
      { texto: "Encender sistemas de ventilación y climatización" },
    ],
  },
  {
    nombre: "Cierre del local",
    descripcion: "Checklist básico de cierre",
    items: [
      { texto: "Registrar limpieza y desinfección de cocina, aseos y sala" },
      { texto: "Guardar y rotular alimentos correctamente" },
      { texto: "Comprobar que refrigeradores y congeladores estén cerrados correctamente" },
      { texto: "Apagar cocinas, hornos, freidoras y gas" },
      { texto: "Vaciar y limpiar basura; colocar bolsas nuevas" },
      { texto: "Cerrar caja y registrar ventas del día" },
      { texto: "Apagar luces, música y equipos eléctricos innecesarios" },
      { texto: "Verificar cierres de puertas, ventanas, accesos y poner alarma (si aplica)" },
    ],
  },
  {
    nombre: "Control de producción",
    descripcion: "Control diario de producción en cocina",
    items: [
      { texto: "Verificar recetas y gramajes según ficha técnica" },
      { texto: "Controlar calidad de materias primas antes de usar" },
      { texto: "Registrar hora de inicio y fin de cada elaboración" },
      { texto: "Etiquetar y fechar todos los productos elaborados" },
      { texto: "Revisar temperaturas de cocción y enfriamiento" },
      { texto: "Comprobar limpieza de utensilios y equipos entre elaboraciones" },
    ],
  },
  {
    nombre: "Higiene del personal",
    descripcion: "Control de buenas prácticas de higiene",
    items: [
      { texto: "Verificar uniformidad completa y limpia del personal" },
      { texto: "Comprobar que el personal lleva el cabello recogido y protegido" },
      { texto: "Revisar ausencia de joyas, relojes y objetos en manos" },
      { texto: "Confirmar lavado de manos al inicio del turno" },
      { texto: "Verificar que no hay personal con síntomas de enfermedad manipulando alimentos" },
    ],
  },
  {
    nombre: "Recepción de mercancía",
    descripcion: "Control en la recepción de pedidos",
    items: [
      { texto: "Verificar que el proveedor coincide con el albarán" },
      { texto: "Comprobar temperatura de productos refrigerados y congelados" },
      { texto: "Revisar estado del envase y embalaje (sin golpes ni rotura)" },
      { texto: "Verificar fechas de caducidad y consumo preferente" },
      { texto: "Comprobar que la cantidad recibida coincide con el pedido" },
      { texto: "Registrar lote y proveedor en el sistema" },
      { texto: "Almacenar los productos en la zona correspondiente inmediatamente" },
    ],
  },
];

export default function TabChecklists({ onChecklistCompletado }) {
  const { currentBusiness, user } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();
  const [plantillas, setPlantillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [ejecutando, setEjecutando] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [seeding, setSeeding] = useState(false);

  async function cargar() {
    if (!currentBusiness) return;
    const data = await base44.entities.ChecklistPlantilla.filter({ business_id: currentBusiness.id }, "-created_date");
    setPlantillas(data);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [currentBusiness]);

  async function seedPredefinidos() {
    if (!currentBusiness || !user) return;
    setSeeding(true);
    for (const p of PREDEFINIDOS) {
      await base44.entities.ChecklistPlantilla.create({
        user_id: user.id,
        business_id: currentBusiness.id,
        nombre: p.nombre,
        descripcion: p.descripcion,
        items: p.items,
        es_predefinido: true,
      });
    }
    await cargar();
    setSeeding(false);
  }

  async function handleDelete(id) {
    await base44.entities.ChecklistPlantilla.delete(id);
    setPlantillas((prev) => prev.filter((p) => p.id !== id));
    setOpenMenu(null);
  }

  function handleSaved() {
    setShowForm(false);
    setEditando(null);
    cargar();
  }

  if (ejecutando) {
    return (
      <EjecutarChecklist
        plantilla={ejecutando}
        onCancel={() => setEjecutando(null)}
        onCompletado={() => { setEjecutando(null); onChecklistCompletado?.(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner informativo */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A3E47] to-[#6BB68A] p-6 relative">
        <div className="absolute right-6 top-4 opacity-10">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
            <path d="M80 10 L150 110 L10 110 Z" fill="white" />
          </svg>
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg mb-1">¿Qué son los Checklists?</p>
            <p className="text-white/85 text-sm leading-relaxed">
              Los checklists son listas de control digitales que te permiten estandarizar y verificar las tareas clave de tu negocio. Son totalmente flexibles: puedes personalizarlos, crear nuevos y adaptarlos a tus necesidades operativas para garantizar siempre la máxima calidad.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      ) : plantillas.length === 0 ? (
        <div className="text-center py-14 space-y-4">
          <p className="text-muted-foreground">No hay checklists creados todavía.</p>
          <Button onClick={seedPredefinidos} disabled={seeding} className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2">
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Cargar checklists predefinidos
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plantillas.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 relative">
              {/* Menu */}
              <div className="absolute top-4 right-4">
                <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)} className="text-muted-foreground hover:text-foreground p-1 rounded">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenu === p.id && (
                  <div className="absolute right-0 top-7 bg-white border border-border rounded-xl shadow-lg z-10 py-1 w-36">
                    <button onClick={() => { setEditando(p); setShowForm(true); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary transition-colors">
                      <Pencil className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                )}
              </div>

              <div className="pr-6">
                <p className="font-bold text-[#0A3E47] text-base leading-snug">{p.nombre}</p>
                {p.descripcion && <p className="text-sm text-muted-foreground mt-0.5">{p.descripcion}</p>}
              </div>

              <div className="flex-1 space-y-1">
                {(p.items || []).slice(0, 3).map((it, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="w-2 h-2 rounded-full bg-[#6BB68A] mt-1.5 shrink-0" />
                    <span className="truncate">{it.texto}</span>
                  </div>
                ))}
                {(p.items || []).length > 3 && (
                  <p className="text-xs text-muted-foreground pl-4">+ {p.items.length - 3} más</p>
                )}
              </div>

              <button
                onClick={() => setEjecutando(p)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors mt-1"
              >
                <Play className="w-4 h-4" />
                Iniciar checklist
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ChecklistFormDialog
          plantilla={editando}
          onClose={() => { setShowForm(false); setEditando(null); }}
          onSaved={handleSaved}
        />
      )}

      {/* Click outside para cerrar menu */}
      {openMenu && <div className="fixed inset-0 z-[5]" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}