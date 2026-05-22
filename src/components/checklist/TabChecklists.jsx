import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Plus, Play, MoreVertical, Pencil, Trash2, Loader2, CheckSquare, ClipboardList, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChecklistFormDialog from "./ChecklistFormDialog";
import EjecutarChecklist from "./EjecutarChecklist";

const PREDEFINIDOS = [
  {
    nombre: "Apertura del local",
    descripcion: "Checklist estándar de apertura",
    items: [
      { texto: "Revisar el estado del cierre" },
      { texto: "Encender la maquinaria de la cocina" },
      { texto: "Registrar la temperatura de equipos de frío" },
      { texto: "Confirmar que los productos abiertos están en envases etiquetados y con fecha" },
      { texto: "Revisar el estado del aceite de las freidoras y planchas" },
      { texto: "Encender maquinaria del mostrador y salón" },
      { texto: "Comprobar que las mesas y sillas están limpias y correctamente colocadas" },
      { texto: "Confirmar que la iluminación, música ambiente, aire acondicionado/calefacción están configuradas" },
      { texto: "Revisar aseos de clientes: papel, jabón, limpieza y basuras vacías" },
      { texto: "Asegurar que los cubos están limpios y con bolsa" },
      { texto: "Revisar tareas administrativas" },
      { texto: "Abrir puertas clientes" },
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
  {
    nombre: "Checklist de inventario y materias primas",
    descripcion: "Control de inventario y estado de materias primas",
    items: [
      { texto: "Control de entradas y salidas de materia prima" },
      { texto: "Revisión de fechas de caducidad y lotes" },
      { texto: "Almacenamiento correcto (FIFO / FEFO)" },
      { texto: "Estado de envases y etiquetado" },
      { texto: "Registro de desperdicios o mermas" },
    ],
  },
  {
    nombre: "Control de producción",
    descripcion: "Control diario de producción en cocina",
    items: [
      { texto: "Verificar recetas y gramajes actualizados" },
      { texto: "Controlar calidad de materias primas (olor, color, fecha)" },
      { texto: "Registrar hora de inicio y fin de producción (ir a Lotes)" },
      { texto: "Revisar temperatura de amasado, fermentado y horneado" },
      { texto: "Controlar cantidad producida vs planificada" },
      { texto: "Registrar incidencias (si las hay)" },
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
    const existentes = await base44.entities.ChecklistPlantilla.filter({ business_id: currentBusiness.id });
    const nombresExistentes = new Set(existentes.map((e) => e.nombre));
    for (const p of PREDEFINIDOS) {
      if (nombresExistentes.has(p.nombre)) continue;
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
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0A3E47]/10 to-[#6BB68A]/20 flex items-center justify-center mb-5">
            <ClipboardList className="w-10 h-10 text-[#0A3E47]/60" />
          </div>
          <h3 className="text-lg font-bold text-[#0A3E47] mb-2">Aún no tienes checklists</h3>
          <p className="text-muted-foreground text-sm text-center max-w-sm mb-8">
            Comienza cargando las plantillas predefinidas o crea tus propias listas de control personalizadas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={seedPredefinidos} disabled={seeding} className="bg-[#0A3E47] hover:bg-[#0A3E47]/90 text-white gap-2 px-6">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Cargar plantillas predefinidas
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">Se cargarán {PREDEFINIDOS.length} checklists listos para usar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...plantillas].sort((a, b) => {
            const orden = PREDEFINIDOS.map(p => p.nombre);
            const ia = orden.indexOf(a.nombre);
            const ib = orden.indexOf(b.nombre);
            if (ia === -1 && ib === -1) return new Date(a.created_date) - new Date(b.created_date);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
          }).map((p) => (
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

          {/* Botón crear nuevo checklist */}
          <button
            onClick={() => { setEditando(null); setShowForm(true); }}
            className="bg-muted/40 border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-muted/60 transition-colors min-h-[200px]"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <span className="font-semibold text-muted-foreground text-sm">Crear nuevo checklist</span>
          </button>
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