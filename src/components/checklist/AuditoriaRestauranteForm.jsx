import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { registrarActividad } from "@/utils/registrarActividad";


const SECCIONES = [
  {
    nombre: "🧠 1. Gestión del APPCC y Registros",
    items: [
      "Se mantienen actualizados los registros de temperaturas de refrigeradores, congeladores y cámaras.",
      "Se registran correctamente las temperaturas de cocción, enfriamiento, abatimiento y mantenimiento en caliente.",
      "Existe un control documentado de incidencias y medidas correctoras.",
      "El registro de limpieza y mantenimiento se encuentra completo y actualizado.",
      "Se realizan y archivan los registros de recepción de materias primas.",
      "Se dispone del registro de control de plagas y tratamientos al día.",
      "Todos los productos están correctamente etiquetados con nombre, fecha de elaboración y caducidad.",
      "Se dispone de documentación actualizada de proveedores (registros sanitarios, fichas técnicas, etc.).",
      "Existe una tabla de alérgenos actualizada y accesible para el personal y los clientes.",
      "Se dispone de un sistema de trazabilidad que permite identificar el origen y destino de los productos.",
    ],
  },
  {
    nombre: "👨‍🍳 2. Manipulación y Procesos de Trabajo",
    items: [
      "El personal cumple con una correcta higiene y manipulación de alimentos.",
      "Se realiza un adecuado lavado de manos con la frecuencia y técnica correctas.",
      "Los alimentos se mantienen tapados y separados de paredes y suelos.",
      "No se observan alimentos caducados, en mal estado o sin identificación.",
      "Se aplica un procedimiento correcto de descongelación.",
      "Las materias primas se reciben en condiciones higiénicas y de temperatura adecuadas.",
      "Se aplica un sistema de almacenamiento FIFO (primero en entrar, primero en salir).",
      "Se dispone de termómetros calibrados para verificar temperaturas de alimentos y equipos.",
      "No hay presencia de cajas, envases o materiales inadecuados en cámaras.",
    ],
  },
  {
    nombre: "💧 3. Control de Agua",
    items: [
      "El establecimiento dispone de suministro de agua potable y en buen estado.",
      "Se realizan controles periódicos o analíticas del agua si el sistema lo requiere.",
      "Los lavamanos disponen de agua corriente, jabón, toallas o secadores y están accesibles.",
    ],
  },
  {
    nombre: "🧴 4. Productos de Limpieza y Químicos",
    items: [
      "Los productos de limpieza están correctamente etiquetados y almacenados separados de los alimentos.",
      "Se dispone de fichas de seguridad (MSDS) de los productos químicos utilizados.",
    ],
  },
  {
    nombre: "🧍 5. Vestuario y Personal",
    items: [
      "El personal dispone de vestuario y taquillas separadas para ropa de calle y de trabajo.",
      "Los uniformes se encuentran limpios, completos y en buen estado.",
    ],
  },
  {
    nombre: "🧹 6. Limpieza, Orden y Mantenimiento",
    items: [
      "El establecimiento presenta un estado general de limpieza, orden y mantenimiento adecuado.",
      "Los aseos del personal y clientes están limpios y equipados con agua corriente, jabón, toallas o secadores y papel higiénico.",
      "Los cubos de basura están limpios, con tapa y de accionamiento no manual.",
      "Los utensilios, equipos y superficies de trabajo están en buen estado y libres de suciedad.",
      "Los mosquiteros, cortinas y protecciones contra insectos están en buen estado.",
      "Las luminarias están protegidas contra roturas y caídas.",
      "Los desagües se encuentran limpios y sin obstrucciones.",
      "No hay grietas ni desprendimientos en paredes, techos o suelos.",
      "No se observan evidencias de presencia de plagas.",
    ],
  },
  {
    nombre: "🗑️ 7. Control de Residuos",
    items: [
      "Los residuos se eliminan con frecuencia y se almacenan en un área limpia y separada de la zona de manipulación.",
      "Se realiza separación selectiva de residuos según normativa local.",
    ],
  },
  {
    nombre: "📘 8. Formación y Cultura de Seguridad Alimentaria",
    items: [
      "Todo el personal ha recibido formación en Buenas Prácticas de Manipulación de Alimentos.",
      "El personal conoce los procedimientos del APPCC y sabe dónde están los registros.",
      "Se realiza formación continua o recordatorios cuando se detectan fallos.",
      "El responsable del local revisa y firma los registros de autocontrol periódicamente.",
    ],
  },
  {
    nombre: "📷 9. Evidencias y Seguimiento",
    items: [
      "Se dispone de evidencias fotográficas de las instalaciones (sala, cocina, aseos, exterior).",
      "Se documentan las no conformidades y se establecen oportunidades de mejora tras cada auditoría.",
      "Se realiza auditoría interna periódica y se documenta las acciones correctoras.",
    ],
  },
];

// Flatten all items to an array with sectionIndex
function buildRespuestasInit() {
  const respuestas = {};
  SECCIONES.forEach((sec, si) => {
    sec.items.forEach((_, ii) => {
      respuestas[`${si}-${ii}`] = null; // null = sin responder, true = cumple, false = no cumple
    });
  });
  return respuestas;
}

export default function AuditoriaRestauranteForm({ onCancel, onGuardado }) {
  const { currentBusiness, user } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();
  const [respuestas, setRespuestas] = useState(buildRespuestasInit);
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  const totalItems = useMemo(() => SECCIONES.reduce((acc, s) => acc + s.items.length, 0), []);
  const respondidos = useMemo(() => Object.values(respuestas).filter((v) => v !== null).length, [respuestas]);
  const cumple = useMemo(() => Object.values(respuestas).filter((v) => v === true).length, [respuestas]);
  const progreso = totalItems > 0 ? Math.round((respondidos / totalItems) * 100) : 0;
  const puntuacion = respondidos > 0 ? Math.round((cumple / totalItems) * 100) : 0;

  function toggle(key, value) {
    setRespuestas((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  async function handleGuardar() {
    if (saving) return;
    setSaving(true);

    const secciones = SECCIONES.map((sec, si) => ({
      nombre: sec.nombre,
      items: sec.items.map((pregunta, ii) => {
        const r = respuestas[`${si}-${ii}`];
        return {
          pregunta,
          estado: r === true ? "cumple" : r === false ? "no_cumple" : "na",
          observacion: "",
        };
      }),
    }));

    await base44.entities.AuditoriaInterna.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      tipo: "restaurante",
      auditor: usuarioActivo?.nombre || user?.full_name || user?.email || "",
      secciones,
      total_items: totalItems,
      items_cumple: cumple,
      puntuacion,
      observaciones_generales: observaciones,
      fecha: new Date().toISOString(),
    });
    base44.entities.RegistroActividad.create({
      user_id: user.id,
      business_id: currentBusiness.id,
      tipo: "auditoria",
      quien: usuarioActivo?.nombre || user?.full_name || user?.email?.split("@")[0] || "Usuario",
      accion: "auditoría interna · Restaurante",
      detalle: `Puntuación: ${puntuacion}%`,
      fecha: new Date().toISOString(),
    }).catch(() => {});

    setSaving(false);
    onGuardado?.();
  }

  return (
    <div className="space-y-4">
      {/* Header sticky */}
      <div className="sticky top-0 z-20 bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="h-1 bg-[#0A3E47]" />
        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <button onClick={onCancel} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* Barra de progreso */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progreso}%`,
                    backgroundColor: progreso === 100 ? "#6BB68A" : progreso >= 75 ? "#ca8a04" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{respondidos}/{totalItems}</span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground font-medium leading-none mb-0.5">Progreso</p>
              <p className={`text-xl font-bold leading-none ${progreso === 0 ? "text-red-500" : progreso >= 75 ? "text-[#2d8a5e]" : "text-yellow-600"}`}>
                {progreso}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Título */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <h2 className="text-2xl font-bold text-foreground">Auditoría interna Restaurante</h2>
        <p className="text-muted-foreground text-sm mt-1">Evaluación completa para restaurantes y hostelería.</p>
      </div>

      {/* Secciones */}
      {SECCIONES.map((sec, si) => (
        <div key={si} className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="font-bold text-foreground text-base">{sec.nombre}</h3>
          </div>
          <div className="divide-y divide-border">
            {sec.items.map((pregunta, ii) => {
              const key = `${si}-${ii}`;
              const val = respuestas[key];
              return (
                <div key={ii} className="flex items-center justify-between gap-4 px-5 py-4">
                  <p className="text-sm text-foreground flex-1">{pregunta}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggle(key, true)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${val === true ? "bg-[#6BB68A] border-[#6BB68A] text-white" : "border-border text-muted-foreground hover:border-[#6BB68A] hover:text-[#6BB68A]"}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggle(key, false)}
                      className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${val === false ? "bg-red-500 border-red-500 text-white" : "border-border text-muted-foreground hover:border-red-400 hover:text-red-400"}`}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Observaciones */}
      <div className="bg-white border border-border rounded-2xl p-5">
        <label className="block text-sm font-semibold text-foreground mb-2">Observaciones generales (opcional)</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Añadir comentarios o notas sobre la auditoría..."
          rows={3}
          className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:border-[#6BB68A] resize-none"
        />
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <button
          onClick={handleGuardar}
          disabled={saving || respondidos === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A3E47] hover:bg-[#0A3E47]/90 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          {saving ? "Guardando..." : "Guardar y Finalizar Auditoría"}
        </button>
      </div>
    </div>
  );
}