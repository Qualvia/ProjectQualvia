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
      "Se dispone de un plan APPCC actualizado y adaptado al tipo de producción.",
      "Se mantienen al día los registros de temperaturas de cámaras, abatidores, hornos y congeladores.",
      "Se registran correctamente las temperaturas de cocción, enfriamiento, abatimiento y almacenamiento.",
      "Existen registros actualizados de limpieza y mantenimiento de equipos e instalaciones.",
      "Se registran las incidencias y medidas correctoras aplicadas.",
      "Se dispone de registros de recepción de materias primas con control de lotes y temperaturas.",
      "Se archivan los registros de control de plagas y tratamientos realizados.",
      "Todos los productos y semielaborados están correctamente etiquetados con nombre, fecha, lote y caducidad.",
      "Se dispone de documentación actualizada de los proveedores (registros sanitarios, fichas técnicas y alérgenos).",
      "Se dispone de fichas técnicas de producto elaboradas, con ingredientes, alérgenos, vida útil y condiciones de conservación.",
      "Se dispone de un sistema de trazabilidad que permite identificar el origen y destino de cada lote.",
    ],
  },
  {
    nombre: "⚙️ 2. Producción y Procesos de Trabajo",
    items: [
      "Los procesos de elaboración se realizan siguiendo las instrucciones y procedimientos documentados.",
      "Las materias primas se manipulan en condiciones higiénicas y de temperatura adecuadas.",
      "Los alimentos y semielaborados se mantienen tapados y correctamente identificados durante el proceso.",
      "No se observan productos caducados o en mal estado.",
      "Se realiza un control correcto de descongelación y no se recongelan productos previamente descongelados.",
      "Se aplica el sistema FIFO o FEFO (primero en entrar, primero en salir / primero en caducar).",
      "Se realiza control visual de cuerpos extraños o contaminaciones cruzadas.",
      "Se dispone de termómetros calibrados y sondas limpias para verificar temperaturas.",
      "Se verifica periódicamente la calibración de instrumentos de medida (termómetros, balanzas, etc.).",
      "No hay presencia de cajas, envases o materiales no alimentarios en las zonas de producción.",
      "Se dispone de un control de productos no conformes o retirados, correctamente identificados y separados.",
    ],
  },
  {
    nombre: "💧 3. Control de Agua",
    items: [
      "El establecimiento dispone de suministro de agua potable, con documentación de analíticas o controles realizados.",
      "Los lavamanos cuentan con agua corriente, jabón, toallas o secadores y están accesibles en zonas de manipulación.",
      "El agua utilizada en la producción cumple los criterios microbiológicos y fisicoquímicos establecidos.",
    ],
  },
  {
    nombre: "🧴 4. Productos de Limpieza y Químicos",
    items: [
      "Los productos de limpieza y desinfección están correctamente etiquetados y almacenados separados de los alimentos.",
      "Se dispone de fichas de seguridad (MSDS) de todos los productos químicos utilizados.",
      "Las concentraciones y tiempos de contacto de los productos de limpieza se aplican según indicaciones del fabricante.",
    ],
  },
  {
    nombre: "🧍 5. Personal y Vestuario",
    items: [
      "El personal dispone de vestuario adecuado, limpio y exclusivo para la zona de producción.",
      "Se dispone de taquillas separadas para ropa de calle y ropa de trabajo.",
      "El personal cumple con la normativa de higiene personal (uñas cortas, sin joyas, cabello recogido, gorro, guantes si aplica).",
      "Los trabajadores utilizan correctamente los equipos de protección individual (EPI) según el proceso.",
    ],
  },
  {
    nombre: "🧹 6. Limpieza, Orden y Mantenimiento",
    items: [
      "Las instalaciones presentan un estado general de limpieza, orden y mantenimiento adecuado.",
      "Los utensilios, bandejas, mesas y equipos están limpios y desinfectados antes y después de su uso.",
      "Los cubos de basura están limpios, con tapa, pedal y situados fuera de las zonas de manipulación directa.",
      "Las zonas de producción, almacenamiento y envasado están libres de acumulación de polvo o residuos.",
      "Los mosquiteros, cortinas y protecciones contra insectos están en buen estado.",
      "Las luminarias están protegidas contra roturas y caídas.",
      "Los desagües están limpios, sin obstrucciones y con rejillas de protección.",
      "No hay grietas, desconchados o humedad en paredes, techos y suelos.",
      "Los equipos e instalaciones se mantienen en buen estado y con mantenimiento preventivo documentado.",
      "No se observan evidencias de presencia de plagas.",
    ],
  },
  {
    nombre: "🗑️ 7. Control de Residuos",
    items: [
      "Los residuos se eliminan con frecuencia y se almacenan en un área separada de la zona de producción.",
      "Se realiza una correcta segregación de residuos (orgánicos, envases, reciclables, especiales).",
      "Los contenedores exteriores están cerrados, limpios y protegidos frente a plagas.",
    ],
  },
  {
    nombre: "📘 8. Formación y Supervisión",
    items: [
      "Todo el personal ha recibido formación en manipulación de alimentos y buenas prácticas de higiene.",
      "El personal conoce los procedimientos del APPCC y los aplica en su trabajo diario.",
      "Se realiza formación periódica o refuerzo cuando se detectan no conformidades.",
      "El responsable del obrador revisa y firma los registros de autocontrol de manera periódica.",
    ],
  },
  {
    nombre: "📷 9. Evidencias y Seguimiento",
    items: [
      "Se dispone de evidencias fotográficas de las zonas de producción, almacenamiento, cámaras y exteriores.",
      "Se documentan las no conformidades detectadas y las acciones correctoras aplicadas.",
      "Se realiza auditoría interna periódica y se archiva el informe con fecha y responsable.",
    ],
  },
];

function buildRespuestasInit() {
  const respuestas = {};
  SECCIONES.forEach((sec, si) => {
    sec.items.forEach((_, ii) => {
      respuestas[`${si}-${ii}`] = null;
    });
  });
  return respuestas;
}

export default function AuditoriaObradorForm({ onCancel, onGuardado }) {
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
      tipo: "industria_obrador",
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
      accion: "auditoría interna · Obrador",
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
        <h2 className="text-2xl font-bold text-foreground">Auditoría interna Industria alimentaria / Obrador</h2>
        <p className="text-muted-foreground text-sm mt-1">Evaluación técnica para obradores y pequeñas industrias.</p>
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