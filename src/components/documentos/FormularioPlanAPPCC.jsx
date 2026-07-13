import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserCog, CheckCircle2, ChevronRight, ChevronLeft, Check, X, Plus, Trash2, Loader2, Info } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";

const TOTAL_PASOS = 7;
const PASOS = [
  "Equipo y responsable",
  "Actividad y circuito",
  "Productos y consumidor",
  "Categorías de proceso",
  "Equipos críticos",
  "Proveedores y agua",
  "Formación y cambios",
];

const DESCRIPCIONES_PASO = [
  "",
  "Cuéntanos cómo trabajas día a día para ajustar los controles.",
  "Identificamos productos de riesgo, alérgenos y casos especiales.",
  "Clasificamos tus procesos para definir los puntos críticos.",
  "Configuramos los equipos que requieren control de temperatura.",
  "Registramos proveedores y el suministro de agua.",
  "Formación del equipo y cambios relevantes del negocio.",
];

const PROCESOS_HABITUALES_OPCIONES = [
  "Recepción de mercancías",
  "Almacenamiento en frío",
  "Almacenamiento en seco",
  "Preparación en frío",
  "Cocción",
  "Fermentación/leudado",
  "Horneado",
  "Etiquetado",
  "Enfriado",
  "Regeneración",
  "Mantenimiento en caliente",
  "Reparto a domicilio (delivery)",
  "Distribución/servicio",
  "Envasado",
  "Venta directa al consumidor en el mismo local",
  "Distribución a otros negocios (B2B/mayorista)",
];

const SEPARACION_OPCIONES = [
  { value: "si", label: "Sí" },
  { value: "no", label: "No" },
  { value: "parcial", label: "Parcialmente" },
];

const RANGO_OPCIONES = [
  { value: "1-10", label: "1-10" },
  { value: "11-25", label: "11-25" },
  { value: "26-50", label: "26-50" },
  { value: "50+", label: "Más de 50" },
];

const CASOS_ESPECIALES_OPCIONES = [
  { label: "Comidas listas para consumo", ejemplo: "Platos sin cocción posterior: ensaladas, sándwiches, bollería rellena" },
  { label: "Productos de alto riesgo", ejemplo: "Carnes o pescados crudos, cremas, salsas caseras" },
  { label: "Población vulnerable", ejemplo: "Niños, ancianos, hospitales, colectividades" },
  { label: "Uso intensivo de alérgenos", ejemplo: "Varios alérgenos combinados en la misma zona: gluten, lácteos, frutos secos..." },
  { label: "Menús o platos bajo pedido para alergias/intolerancias", ejemplo: "Ej: menú sin gluten, plato apto para celíacos garantizado" },
  { label: "Ninguno de los anteriores", ejemplo: null },
];

const CATEGORIAS_PROCESO_OPCIONES = [
  { key: "caliente_inmediato", label: "Caliente, servido al momento", ejemplo: "Guisos, salteados, platos de cuchara" },
  { key: "frio_sin_coccion", label: "Frío, sin cocción", ejemplo: "Ensaladas, sándwiches, fríos" },
  { key: "crudo_alto_riesgo", label: "Crudo de alto riesgo", ejemplo: "Pescado crudo, carpaccios, carne poco hecha" },
  { key: "produccion_anticipada", label: "Producción anticipada", ejemplo: "Cocinar hoy, servir después" },
  { key: "congelacion_descongelacion", label: "Congelación/descongelación", ejemplo: "Uso de producto congelado" },
  { key: "panaderia_pasteleria", label: "Panadería/pastelería", ejemplo: "Masas, horneado, rellenos" },
  { key: "fabricacion_distribucion", label: "Fabricación para distribución", ejemplo: "Envasado y etiquetado, sin servicio directo" },
  { key: "envasado_vacio", label: "Envasado al vacío / atm. modificada", ejemplo: "Riesgo de Clostridium botulinum sin oxígeno" },
];

export default function FormularioPlanAPPCC({ open, onOpenChange }) {
  const { user, currentBusiness } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();
  const { toast } = useToast();

  const [pasoActual, setPasoActual] = useState(1);
  const [perfilCargado, setPerfilCargado] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [configCargada, setConfigCargada] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Formación APPCC ---
  const [tieneFormacion, setTieneFormacion] = useState(null); // "si" | "no" | null
  const [personasFormacion, setPersonasFormacion] = useState([]); // [{ id, nombre }]
  const [nuevaPersona, setNuevaPersona] = useState("");

  // --- Paso 2: Actividad y circuito ---
  const [procesosHabituales, setProcesosHabituales] = useState([]);
  const [separacionCircuitos, setSeparacionCircuitos] = useState(null); // "si" | "no" | "parcial" | null
  const [rangoReferencias, setRangoReferencias] = useState(null); // "1-10" | "11-25" | "26-50" | "50+" | null

  // --- Paso 3: Productos y consumidor ---
  const [casosEspeciales, setCasosEspeciales] = useState([]);
  const [alergenos, setAlergenos] = useState([]);
  const [nuevoAlergeno, setNuevoAlergeno] = useState("");

  // --- Paso 4: Categorías de proceso ---
  const [categoriasProceso, setCategoriasProceso] = useState([]);

  // --- Responsable ---
  // Prioridad: config guardada → usuario interno activo → persona_contacto del BusinessProfile → propietario
  const [contactoNegocio, setContactoNegocio] = useState("");

  const detectado = usuarioActivo
    ? { nombre: usuarioActivo.nombre || "", rol: usuarioActivo.rol || "" }
    : { nombre: user?.full_name || contactoNegocio || "", rol: "Propietario" };

  const [editandoResponsable, setEditandoResponsable] = useState(false);
  const [responsableNombre, setResponsableNombre] = useState(detectado.nombre);
  const [responsableRol, setResponsableRol] = useState(detectado.rol);
  const [errorResponsable, setErrorResponsable] = useState(false);

  // Cargar ConfiguracionAPPCC existente — tiene prioridad sobre la autodetección
  useEffect(() => {
    if (!open || !currentBusiness) return;
    setConfigCargada(false);
    base44.entities.ConfiguracionAPPCC.filter({ business_id: currentBusiness.id })
      .then(async (data) => {
        const config = data[0];
        if (config) {
          setConfigId(config.id);
          setResponsableNombre(config.responsable_nombre || "");
          setResponsableRol(config.responsable_rol || "Propietario");
          setTieneFormacion(config.tiene_formacion_appcc || null);
          setPersonasFormacion(
            (config.formacion_personas || []).map((nombre) => ({ id: Date.now() + Math.random(), nombre }))
          );
          setProcesosHabituales(config.procesos_habituales || []);
          setSeparacionCircuitos(config.separacion_circuitos || null);
          setRangoReferencias(config.rango_referencias || null);
          setCasosEspeciales(config.casos_especiales || []);
          setAlergenos(config.alergenos || []);
          setCategoriasProceso(config.categorias_proceso || []);
        }
        // Si NO hay config guardada con alérgenos, precargar desde los registros de alérgenos
        if (!config || !config.alergenos || config.alergenos.length === 0) {
          try {
            const registros = await base44.entities.RegistroAlergeno.filter({ business_id: currentBusiness.id });
            const todos = (registros || []).flatMap((r) => r.alergenos || []);
            setAlergenos(Array.from(new Set(todos)));
          } catch (e) {}
        }
      })
      .catch(() => {})
      .finally(() => setConfigCargada(true));
  }, [open, currentBusiness]);

  // Cargar persona_contacto del BusinessProfile al abrir el modal — solo si no hay config guardada
  useEffect(() => {
    if (!open || !currentBusiness) return;
    setPerfilCargado(false);
    base44.entities.BusinessProfile.filter({ business_id: currentBusiness.id })
      .then((data) => {
        const contacto = data[0]?.persona_contacto || "";
        setContactoNegocio(contacto);
        // Solo autodetectar si no hay config guardada y no hay usuario interno
        if (!configId && !usuarioActivo) {
          setResponsableNombre(contacto || user?.full_name || "");
        }
      })
      .catch(() => {})
      .finally(() => setPerfilCargado(true));
  }, [open, currentBusiness, configId]);

  const anadirPersona = () => {
    const valor = nuevaPersona.trim();
    if (!valor) return;
    setPersonasFormacion((prev) => [...prev, { id: Date.now(), nombre: valor }]);
    setNuevaPersona("");
  };

  const eliminarPersona = (id) => {
    setPersonasFormacion((prev) => prev.filter((p) => p.id !== id));
  };

  const puedeAvanzarPaso1 = responsableNombre.trim() !== "" && tieneFormacion !== null;
  const puedeAvanzarPaso2 =
    procesosHabituales.length > 0 && separacionCircuitos !== null && rangoReferencias !== null;
  const puedeAvanzarPaso3 = casosEspeciales.length > 0;
  const puedeAvanzarPaso4 = categoriasProceso.length > 0;

  const puedeAvanzar =
    pasoActual === 1 ? puedeAvanzarPaso1
    : pasoActual === 2 ? puedeAvanzarPaso2
    : pasoActual === 3 ? puedeAvanzarPaso3
    : pasoActual === 4 ? puedeAvanzarPaso4
    : true;

  const toggleProceso = (proceso) => {
    setProcesosHabituales((prev) =>
      prev.includes(proceso) ? prev.filter((p) => p !== proceso) : [...prev, proceso]
    );
  };

  const toggleCasoEspecial = (caso) => {
    const NINGUNO = "Ninguno de los anteriores";
    setCasosEspeciales((prev) => {
      if (caso === NINGUNO) {
        return prev.includes(caso) ? prev.filter((c) => c !== caso) : [caso];
      }
      if (prev.includes(caso)) {
        return prev.filter((c) => c !== caso);
      }
      return [...prev.filter((c) => c !== NINGUNO), caso];
    });
  };

  const toggleCategoria = (key) => {
    setCategoriasProceso((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const anadirAlergeno = () => {
    const valor = nuevoAlergeno.trim();
    if (!valor) return;
    setAlergenos((prev) => (prev.includes(valor) ? prev : [...prev, valor]));
    setNuevoAlergeno("");
  };

  const eliminarAlergeno = (valor) => {
    setAlergenos((prev) => prev.filter((a) => a !== valor));
  };

  const handleSiguiente = async () => {
    if (pasoActual === 1) {
      if (!responsableNombre.trim()) {
        setEditandoResponsable(true);
        setErrorResponsable(true);
        return;
      }
      setErrorResponsable(false);
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      business_id: currentBusiness.id,
      responsable_nombre: responsableNombre,
      responsable_rol: responsableRol,
      tiene_formacion_appcc: tieneFormacion,
      formacion_personas: personasFormacion.map((p) => p.nombre),
      procesos_habituales: procesosHabituales,
      separacion_circuitos: separacionCircuitos,
      rango_referencias: rangoReferencias,
      casos_especiales: casosEspeciales,
      alergenos: alergenos,
      categorias_proceso: categoriasProceso,
    };
    try {
      if (configId) {
        await base44.entities.ConfiguracionAPPCC.update(configId, payload);
      } else {
        const created = await base44.entities.ConfiguracionAPPCC.create(payload);
        if (created?.id) setConfigId(created.id);
      }
    } catch (e) {
      setSaving(false);
      toast({
        title: "No se pudo guardar. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return;
    }
    setSaving(false);
    if (pasoActual < TOTAL_PASOS) {
      setPasoActual((prev) => prev + 1);
    }
  };

  const handleAtras = () => {
    if (pasoActual > 1) {
      setPasoActual((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 rounded-2xl bg-[#FAFAF7] [&>button]:hidden">
        {/* --- Barra de progreso superior --- */}
        <div className="px-6 pt-5 pb-4 border-b border-[#EDE6DA]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-[#4A4A4A]">
              Paso {pasoActual} de {TOTAL_PASOS}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-medium text-[#4A4A4A]">
                {PASOS[pasoActual - 1]}
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#9A9A9A] hover:text-[#0A3E47] hover:bg-[#0A3E47]/8 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[#EDE6DA] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0A3E47] transition-all duration-700 ease-out"
              style={{ width: `${(pasoActual / TOTAL_PASOS) * 100}%` }}
            />
          </div>
        </div>

        {/* --- Cabecera del documento --- */}
        <div className="px-6 pt-6 pb-2">
          {pasoActual === 1 ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A3E47] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-[#0A3E47] text-xl font-bold leading-tight">
                  Formulario previo — Plan APPCC
                </DialogTitle>
              </div>
              <DialogDescription className="text-[13px] text-[#6B6B6B] leading-relaxed">
                Para dejar tu Plan APPCC bien afinado, necesitamos confirmar algunos datos reales de
                tu negocio. Lo que ya sabemos por tus registros no te lo volveremos a preguntar.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-[#0A3E47] text-xl font-bold leading-tight mb-1.5">
                {PASOS[pasoActual - 1]}
              </DialogTitle>
              <DialogDescription className="text-[13px] text-[#6B6B6B] leading-relaxed">
                {DESCRIPCIONES_PASO[pasoActual - 1]}
              </DialogDescription>
            </>
          )}
        </div>

        {/* --- Cuerpo con slide --- */}
        <div className="px-6 py-5 space-y-6 max-h-[52vh] overflow-y-auto">
          <div key={pasoActual} className="animate-in fade-in-0 slide-in-from-right-4 duration-500 space-y-6">
            {pasoActual === 1 && (
              <>
            {/* Sección: Equipo y responsable */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#EDE6DA] flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4 text-[#0A3E47]" />
                </div>
                <h3 className="text-sm font-bold text-[#0A3E47]">Equipo y responsable</h3>
              </div>

              {/* Alert box / editable */}
              {!editandoResponsable ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#6BB68A]/30 bg-[#6BB68A]/10 px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-[#0A3E47] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0A3E47] leading-tight">
                        Responsable detectado desde tu equipo
                      </p>
                      <p className="text-[12px] text-[#4A4A4A] truncate">
                        {responsableNombre || "Sin nombre"} · {responsableRol}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditandoResponsable(true)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full border border-[#0A3E47] text-[12px] font-semibold text-[#0A3E47] hover:bg-[#0A3E47] hover:text-white transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-[#EDE6DA] bg-white px-4 py-4 space-y-3 animate-in fade-in-0 duration-300">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#6B6B6B]">Nombre del responsable</Label>
                    <Input
                      value={responsableNombre}
                      onChange={(e) => {
                        setResponsableNombre(e.target.value);
                        if (e.target.value.trim()) setErrorResponsable(false);
                      }}
                      placeholder="Ej. María García"
                      autoFocus
                      className={
                        errorResponsable
                          ? "border-[#c0392b] focus-visible:ring-[#c0392b]"
                          : "border-[#EDE6DA] focus-visible:ring-[#0A3E47]"
                      }
                    />
                    {errorResponsable && (
                      <p className="text-[11px] text-[#c0392b] font-medium">
                        Indica el nombre del responsable
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#6B6B6B]">Rol / cargo</Label>
                    <Input
                      value={responsableRol}
                      onChange={(e) => setResponsableRol(e.target.value)}
                      placeholder="Ej. Gerente, Técnico de calidad…"
                      className="border-[#EDE6DA] focus-visible:ring-[#0A3E47]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditandoResponsable(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A3E47] text-white text-[12px] font-semibold hover:bg-[#0A3E47] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Sección: Formación APPCC */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-4">
                ¿Alguien del equipo tiene formación específica en APPCC, o contáis con asesoría
                externa?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTieneFormacion("si")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tieneFormacion === "si"
                      ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                      : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setTieneFormacion("no")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tieneFormacion === "no"
                      ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                      : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                  }`}
                >
                  No
                </button>
              </div>

              {tieneFormacion === "si" && (
                <div className="mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300 space-y-3">
                  {/* Lista de personas/asesorías añadidas */}
                  {personasFormacion.length > 0 && (
                    <div className="space-y-2">
                      {personasFormacion.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[#6BB68A]/30 bg-[#6BB68A]/10 px-3.5 py-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-[#0A3E47] shrink-0" />
                            <span className="text-[13px] font-medium text-[#0A3E47] truncate">
                              {p.nombre}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => eliminarPersona(p.id)}
                            className="shrink-0 p-1 rounded-md text-[#9A9A9A] hover:text-[#c0392b] hover:bg-[#c0392b]/8 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input + botón añadir */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={nuevaPersona}
                      onChange={(e) => setNuevaPersona(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          anadirPersona();
                        }
                      }}
                      placeholder="Nombre de la persona o de la asesoría"
                      className="border-[#EDE6DA] focus-visible:ring-[#0A3E47]"
                    />
                    <button
                      type="button"
                      onClick={anadirPersona}
                      disabled={!nuevaPersona.trim()}
                      className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A3E47] text-white text-[13px] font-semibold hover:bg-[#0A3E47] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Añadir
                    </button>
                  </div>
                </div>
              )}
            </section>
              </>
            )}

            {pasoActual === 2 && (
              <>
            {/* Sección: Procesos habituales */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-4">
                ¿Qué procesos habituales se realizan en tu negocio?
              </p>
              <p className="text-[12px] text-[#6B6B6B] mb-4">
                Selecciona todos los que apliquen.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {PROCESOS_HABITUALES_OPCIONES.map((proceso) => {
                  const activo = procesosHabituales.includes(proceso);
                  return (
                    <button
                      key={proceso}
                      type="button"
                      onClick={() => toggleProceso(proceso)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                        activo
                          ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                          : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                      }`}
                    >
                      {activo && <Check className="w-3.5 h-3.5" />}
                      {proceso}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sección: Separación de circuitos */}
            <section>
              <div className="flex items-center gap-1.5 mb-4">
                <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug">
                  ¿Existe separación de circuitos (limpio/sucio)?
                </p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="shrink-0 inline-flex items-center">
                      <Info className="w-4 h-4 text-[#9A9A9A] hover:text-[#0A3E47]" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto max-w-64 text-sm bg-white">
                    Se refiere a evitar el cruce entre zonas limpias (manipulación de alimentos) y sucias (residuos, suciedad, embalajes) para prevenir la contaminación cruzada.
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {SEPARACION_OPCIONES.map((opt) => {
                  const activo = separacionCircuitos === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSeparacionCircuitos(opt.value)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activo
                          ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                          : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sección: Rango de referencias */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-4">
                ¿Cuántas referencias o productos distintos manejas aproximadamente?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {RANGO_OPCIONES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRangoReferencias(opt.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      rangoReferencias === opt.value
                        ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                        : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
              </>
            )}

            {pasoActual === 3 && (
              <>
            {/* Sección: Productos y consumidor — casos especiales */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-1">
                ¿Se da alguno de estos casos especiales en tu negocio?
              </p>
              <p className="text-[12px] text-[#6B6B6B] mb-4">
                Selecciona todos los que apliquen.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {CASOS_ESPECIALES_OPCIONES.map((opt) => {
                  const activo = casosEspeciales.includes(opt.label);
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => toggleCasoEspecial(opt.label)}
                      className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 text-center ${
                        activo
                          ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                          : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                      }`}
                    >
                      {activo && <Check className="w-3.5 h-3.5 inline align-middle mr-1" />}
                      {opt.label}
                      {opt.ejemplo && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="inline-flex align-middle ml-1"
                            >
                              <Info className={`w-4 h-4 ${activo ? "text-white/70" : "text-[#9A9A9A]"}`} />
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto max-w-56 text-sm bg-white">
                            {opt.ejemplo}
                          </PopoverContent>
                        </Popover>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Sección: Alérgenos */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-1">
                Alérgenos presentes en tu negocio
              </p>
              <p className="text-[12px] text-[#6B6B6B] mb-4">
                Detectados desde tus registros — puedes añadir o quitar.
              </p>

              {alergenos.length > 0 && (
                <div className="space-y-2 mb-3">
                  {alergenos.map((alergeno) => (
                    <div
                      key={alergeno}
                      className="flex items-center justify-between gap-2 rounded-lg border border-[#6BB68A]/30 bg-[#6BB68A]/10 px-3.5 py-2.5 animate-in fade-in-0 slide-in-from-top-1 duration-200"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#0A3E47] shrink-0" />
                        <span className="text-[13px] font-medium text-[#0A3E47] truncate">
                          {alergeno}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarAlergeno(alergeno)}
                        className="shrink-0 p-1 rounded-md text-[#9A9A9A] hover:text-[#c0392b] hover:bg-[#c0392b]/8 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Input
                  value={nuevoAlergeno}
                  onChange={(e) => setNuevoAlergeno(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      anadirAlergeno();
                    }
                  }}
                  placeholder="Ej. Gluten, Lácteos, Frutos secos…"
                  className="border-[#EDE6DA] focus-visible:ring-[#0A3E47]"
                />
                <button
                  type="button"
                  onClick={anadirAlergeno}
                  disabled={!nuevoAlergeno.trim()}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A3E47] text-white text-[13px] font-semibold hover:bg-[#0A3E47] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
            </section>
              </>
            )}

            {pasoActual === 4 && (
              <>
            {/* Sección: Categorías de proceso */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-1">
                ¿Qué tipo de alimentos elaboras o sirves habitualmente?
              </p>
              <p className="text-[12px] text-[#6B6B6B] mb-4">
                Selecciona todos los que apliquen.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIAS_PROCESO_OPCIONES.map((opt) => {
                  const activo = categoriasProceso.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleCategoria(opt.key)}
                      className={`py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all duration-200 text-center ${
                        activo
                          ? "bg-[#0A3E47] text-white border-2 border-[#0A3E47]"
                          : "bg-white text-[#0A3E47] border-2 border-[#0A3E47] hover:bg-[#0A3E47]/5"
                      }`}
                    >
                      {activo && <Check className="w-3.5 h-3.5 inline align-middle mr-1" />}
                      {opt.label}
                      {opt.ejemplo && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => e.stopPropagation()}
                              onPointerDown={(e) => e.stopPropagation()}
                              className="inline-flex align-middle ml-1"
                            >
                              <Info className={`w-4 h-4 ${activo ? "text-white/70" : "text-[#9A9A9A]"}`} />
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto max-w-56 text-sm bg-white">
                            {opt.ejemplo}
                          </PopoverContent>
                        </Popover>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
              </>
            )}
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-[#EDE6DA] bg-[#FAFAF7] flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-[14px] font-medium text-[#6B6B6B] hover:text-[#0A3E47] transition-colors"
            >
              Cancelar
            </button>
            {pasoActual > 1 && (
              <button
                type="button"
                onClick={handleAtras}
                disabled={saving}
                className="flex items-center gap-1 text-[14px] font-medium text-[#0A3E47] hover:text-[#0A3E47]/70 transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            )}
          </div>
          <Button
            onClick={handleSiguiente}
            disabled={!puedeAvanzar || saving}
            className="bg-[#6BB68A] hover:bg-[#5aa377] !text-white px-6 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}