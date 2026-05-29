import React, { useState, useEffect, lazy, Suspense } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
const GestionarEquiposDialog = lazy(() => import("@/components/GestionarEquiposDialog"));
const GestionarProveedoresDialog = lazy(() => import("@/components/GestionarProveedoresDialog"));
import {
  Thermometer, Droplets, ClipboardCheck, Waves, Bug, Wrench,
  GraduationCap, Apple, Package, Snowflake, Trash2, AlertTriangle,
  Settings, Plus, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy-load todos los formularios y listas pesadas
const NuevoRegistroTemperatura = lazy(() => import("@/components/NuevoRegistroTemperatura"));
const ListaRegistrosTemperatura = lazy(() => import("@/components/ListaRegistrosTemperatura"));
const NuevoRegistroLimpieza = lazy(() => import("@/components/NuevoRegistroLimpieza"));
const ListaRegistrosLimpieza = lazy(() => import("@/components/ListaRegistrosLimpieza"));
const NuevoRegistroRecepcion = lazy(() => import("@/components/NuevoRegistroRecepcion"));
const ListaRegistrosRecepcion = lazy(() => import("@/components/ListaRegistrosRecepcion"));
const NuevoRegistroAgua = lazy(() => import("@/components/NuevoRegistroAgua"));
const ListaRegistrosAgua = lazy(() => import("@/components/ListaRegistrosAgua"));
const SuministroAguaDialog = lazy(() => import("@/components/SuministroAguaDialog"));
const NuevoRegistroPlaga = lazy(() => import("@/components/NuevoRegistroPlaga"));
const ListaRegistrosPlagas = lazy(() => import("@/components/ListaRegistrosPlagas"));
const GestorPlagasDialog = lazy(() => import("@/components/GestorPlagasDialog"));
const NuevoRegistroMantenimiento = lazy(() => import("@/components/NuevoRegistroMantenimiento"));
const ListaRegistrosMantenimiento = lazy(() => import("@/components/ListaRegistrosMantenimiento"));
const EmpresaMantenimientoDialog = lazy(() => import("@/components/EmpresaMantenimientoDialog"));
const NuevoRegistroFormacion = lazy(() => import("@/components/NuevoRegistroFormacion"));
const ListaRegistrosFormacion = lazy(() => import("@/components/ListaRegistrosFormacion"));
const NuevoRegistroAlergeno = lazy(() => import("@/components/NuevoRegistroAlergeno"));
const ListaRegistrosAlergenos = lazy(() => import("@/components/ListaRegistrosAlergenos"));
const NuevoRegistroLote = lazy(() => import("@/components/NuevoRegistroLote"));
const ListaRegistrosLotes = lazy(() => import("@/components/ListaRegistrosLotes"));
const NuevoRegistroCongelacion = lazy(() => import("@/components/NuevoRegistroCongelacion"));
const ListaRegistrosCongelacion = lazy(() => import("@/components/ListaRegistrosCongelacion"));
const NuevoRegistroResiduo = lazy(() => import("@/components/NuevoRegistroResiduo"));
const ListaRegistrosResiduos = lazy(() => import("@/components/ListaRegistrosResiduos"));
const GestorResiduosDialog = lazy(() => import("@/components/GestorResiduosDialog"));
const GestionIncidencias = lazy(() => import("@/components/incidencias/GestionIncidencias"));

const REGISTROS = [
  { id: "temperatura", label: "Temperatura", icon: Thermometer, color: "bg-red-500 border-red-500 text-white" },
  { id: "limpieza", label: "Limpieza", icon: Droplets, color: "bg-cyan-500 border-cyan-500 text-white" },
  { id: "recepcion", label: "Recepción", icon: ClipboardCheck, color: "bg-orange-400 border-orange-400 text-white" },
  { id: "agua", label: "Agua", icon: Waves, color: "bg-blue-500 border-blue-500 text-white" },
  { id: "plagas", label: "Plagas", icon: Bug, color: "bg-amber-700 border-amber-700 text-white" },
  { id: "mantenimiento", label: "Mantenimiento", icon: Wrench, color: "bg-slate-500 border-slate-500 text-white" },
  { id: "formacion", label: "Formación", icon: GraduationCap, color: "bg-purple-500 border-purple-500 text-white" },
  { id: "alergenos", label: "Alérgenos", icon: Apple, color: "bg-yellow-500 border-yellow-500 text-white" },
  { id: "lotes", label: "Lotes", icon: Package, color: "bg-teal-500 border-teal-500 text-white" },
  { id: "congelacion", label: "Congelación", icon: Snowflake, color: "bg-sky-400 border-sky-400 text-white" },
  { id: "residuos", label: "Residuos", icon: Trash2, color: "bg-green-600 border-green-600 text-white" },
  { id: "incidencias", label: "Incidencias", icon: AlertTriangle, color: "" },
];

const INCIDENCIA_ALERT_COLOR = "bg-red-100 border-red-300 text-red-700";

const SuspenseFallbackForm = () => (
  <div className="bg-secondary rounded-2xl p-6 flex justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
);

const SuspenseFallbackList = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-border p-6 flex justify-center">
    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
  </div>
);

export default function Registros() {
  const [active, setActive] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tab") || "temperatura";
  });
  const [showGestionar, setShowGestionar] = useState(false);
  const [gestionarTab, setGestionarTab] = useState("equipos");
  const [showProveedores, setShowProveedores] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("accion") === "proveedores";
  });
  const [showSuministroAgua, setShowSuministroAgua] = useState(false);
  const [showGestorPlagas, setShowGestorPlagas] = useState(false);
  const [showEmpresaMantenimiento, setShowEmpresaMantenimiento] = useState(false);
  const [showNuevoRegistro, setShowNuevoRegistro] = useState(false);
  const [registroKey, setRegistroKey] = useState(0);
  const [limpiezaKey, setLimpiezaKey] = useState(0);
  const [recepcionKey, setRecepcionKey] = useState(0);
  const [aguaKey, setAguaKey] = useState(0);
  const [plagasKey, setPlagasKey] = useState(0);
  const [mantenimientoKey, setMantenimientoKey] = useState(0);
  const [formacionKey, setFormacionKey] = useState(0);
  const [alergenosKey, setAlergenosKey] = useState(0);
  const [lotesKey, setLotesKey] = useState(0);
  const [congelacionKey, setCongelacionKey] = useState(0);
  const [residuosKey, setResiduosKey] = useState(0);
  const [showGestorResiduos, setShowGestorResiduos] = useState(false);
  const [incidenciasKey, setIncidenciasKey] = useState(0);
  const [hayIncidenciasAbiertas, setHayIncidenciasAbiertas] = useState(false);
  const { currentBusiness } = useBusiness();
  const { esOperario } = useUsuarioInterno();

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.Incidencia.filter({ business_id: currentBusiness.id, estado: "abierta" }, "-fecha", 1, 0)
      .then((data) => setHayIncidenciasAbiertas(data.length > 0))
      .catch(() => {});
  }, [currentBusiness, incidenciasKey]);

  const activeRegistro = REGISTROS.find((r) => r.id === active);
  const ActiveIcon = activeRegistro?.icon;

  return (
    <div className="p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A3E47]">Registros</h1>
          <p className="text-lg text-[#6BB68A] font-medium mt-0.5">
            Gestiona todos tus controles diarios
          </p>
        </div>
        {!esOperario && (
          <div className="flex flex-col gap-2 shrink-0">
            <Button className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2" onClick={() => setShowGestionar(true)}>
              <Plus className="w-4 h-4" />
              Gestionar equipos/zonas
            </Button>
            <Button variant="outline" className="border-[#6BB68A] text-[#6BB68A] hover:bg-[#6BB68A]/10 gap-2" onClick={() => setShowProveedores(true)}>
              <Plus className="w-4 h-4" />
              Gestionar proveedores
            </Button>
          </div>
        )}
      </div>

      {/* Grid de registros */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-2">
        {REGISTROS.filter(({ id }) => !(esOperario && id === "incidencias")).map(({ id, label, icon: Icon, color }) => {
          const isActive = active === id;
          const isIncidencia = id === "incidencias";
          const incidenciaAlert = isIncidencia && hayIncidenciasAbiertas;
          return (
            <button
              key={id}
              onClick={() => { setActive(id); setShowNuevoRegistro(false); }}
              className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all aspect-square
                ${isActive
                  ? color
                    ? `${color} shadow-md`
                    : incidenciaAlert
                      ? `${INCIDENCIA_ALERT_COLOR} shadow-md`
                      : "bg-slate-200 border-slate-300 text-foreground shadow-md"
                  : incidenciaAlert && !isActive
                    ? `${INCIDENCIA_ALERT_COLOR}`
                    : "bg-white border-border text-foreground hover:border-[#6BB68A] hover:shadow-sm"
                }`}
            >
              <Icon className="w-7 h-7" strokeWidth={2.5} />
              <span className="text-xs font-semibold leading-tight text-center">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel del registro activo */}
      {activeRegistro && (
        <div className="space-y-4">
          <div className="bg-secondary rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {ActiveIcon && <ActiveIcon className="w-5 h-5 text-[#0A3E47]" strokeWidth={1.5} />}
              <span className="font-semibold text-[#0A3E47]">
                {active === "incidencias" ? "Gestión de Incidencias" : active === "congelacion" ? "Control de congelación/descongelación" : `Control de ${activeRegistro.label}${active === "temperatura" ? " (°C)" : ""}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!esOperario && active === "agua" && (
                <Button variant="outline" className="bg-white gap-2 text-sm" onClick={() => setShowSuministroAgua(true)}>
                  <Waves className="w-4 h-4" />
                  Suministro agua
                </Button>
              )}
              {!esOperario && active === "plagas" && (
                <Button variant="outline" className="bg-white gap-2 text-sm" onClick={() => setShowGestorPlagas(true)}>
                  <Bug className="w-4 h-4" />
                  Gestor plagas
                </Button>
              )}
              {!esOperario && active === "mantenimiento" && (
                <Button variant="outline" className="bg-white gap-2 text-sm" onClick={() => setShowEmpresaMantenimiento(true)}>
                  <Wrench className="w-4 h-4" />
                  Empresa mantenimiento
                </Button>
              )}
              {!esOperario && active === "residuos" && (
                <Button variant="outline" className="bg-white gap-2 text-sm" onClick={() => setShowGestorResiduos(true)}>
                  <Trash2 className="w-4 h-4" />
                  Gestor de residuos
                </Button>
              )}
              {!esOperario && active === "temperatura" && (
                <Button variant="outline" size="icon" className="bg-white" onClick={() => { setGestionarTab("equipos"); setShowGestionar(true); }}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              {!esOperario && active === "limpieza" && (
                <Button variant="outline" size="icon" className="bg-white" onClick={() => { setGestionarTab("zonas"); setShowGestionar(true); }}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              {!esOperario && active === "agua" && (
                <Button variant="outline" size="icon" className="bg-white" onClick={() => { setGestionarTab("agua"); setShowGestionar(true); }}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              {!esOperario && active === "plagas" && (
                <Button variant="outline" size="icon" className="bg-white" onClick={() => { setGestionarTab("plagas"); setShowGestionar(true); }}>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              )}
              {active === "incidencias" ? (
                <Button
                  className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
                  onClick={() => setShowNuevoRegistro((v) => !v)}
                >
                  <Plus className="w-4 h-4" />
                  Nueva incidencia
                </Button>
              ) : (
                <Button
                  className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
                  onClick={() => setShowNuevoRegistro((v) => !v)}
                >
                  <Plus className="w-4 h-4" />
                  Nuevo registro
                </Button>
              )}
            </div>
          </div>

          {/* Formularios inline — lazy */}
          {showNuevoRegistro && active === "temperatura" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroTemperatura onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setRegistroKey((k) => k + 1); setIncidenciasKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "limpieza" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroLimpieza onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setLimpiezaKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "recepcion" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroRecepcion onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setRecepcionKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "agua" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroAgua onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setAguaKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "plagas" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroPlaga onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setPlagasKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "mantenimiento" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroMantenimiento onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setMantenimientoKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "formacion" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroFormacion onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setFormacionKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "alergenos" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroAlergeno onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setAlergenosKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "lotes" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroLote onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setLotesKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "congelacion" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroCongelacion onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setCongelacionKey((k) => k + 1); }} />
            </Suspense>
          )}
          {showNuevoRegistro && active === "residuos" && (
            <Suspense fallback={<SuspenseFallbackForm />}>
              <NuevoRegistroResiduo onCancel={() => setShowNuevoRegistro(false)} onSaved={() => { setShowNuevoRegistro(false); setResiduosKey((k) => k + 1); }} />
            </Suspense>
          )}

          {/* Listas — lazy */}
          {active === "temperatura" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosTemperatura refreshKey={registroKey} />
            </Suspense>
          )}
          {active === "limpieza" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosLimpieza refreshKey={limpiezaKey} />
            </Suspense>
          )}
          {active === "recepcion" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosRecepcion refreshKey={recepcionKey} />
            </Suspense>
          )}
          {active === "agua" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosAgua refreshKey={aguaKey} />
            </Suspense>
          )}
          {active === "plagas" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosPlagas refreshKey={plagasKey} />
            </Suspense>
          )}
          {active === "mantenimiento" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosMantenimiento refreshKey={mantenimientoKey} />
            </Suspense>
          )}
          {active === "formacion" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosFormacion refreshKey={formacionKey} />
            </Suspense>
          )}
          {active === "alergenos" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosAlergenos refreshKey={alergenosKey} />
            </Suspense>
          )}
          {active === "lotes" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosLotes refreshKey={lotesKey} />
            </Suspense>
          )}
          {active === "congelacion" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosCongelacion refreshKey={congelacionKey} />
            </Suspense>
          )}
          {active === "residuos" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <ListaRegistrosResiduos refreshKey={residuosKey} />
            </Suspense>
          )}
          {active === "incidencias" && (
            <Suspense fallback={<SuspenseFallbackList />}>
              <GestionIncidencias
                refreshKey={incidenciasKey}
                onIncidenciasChange={() => setIncidenciasKey((k) => k + 1)}
                showNuevo={showNuevoRegistro}
                onCloseNuevo={() => setShowNuevoRegistro(false)}
              />
            </Suspense>
          )}
        </div>
      )}

      {showGestionar && (
        <Suspense fallback={null}>
          <GestionarEquiposDialog open={showGestionar} onOpenChange={setShowGestionar} initialTab={gestionarTab} />
        </Suspense>
      )}
      {showProveedores && (
        <Suspense fallback={null}>
          <GestionarProveedoresDialog open={showProveedores} onOpenChange={setShowProveedores} />
        </Suspense>
      )}
      {showSuministroAgua && (
        <Suspense fallback={null}>
          <SuministroAguaDialog open={showSuministroAgua} onOpenChange={setShowSuministroAgua} />
        </Suspense>
      )}
      {showGestorPlagas && (
        <Suspense fallback={null}>
          <GestorPlagasDialog open={showGestorPlagas} onOpenChange={setShowGestorPlagas} />
        </Suspense>
      )}
      {showEmpresaMantenimiento && (
        <Suspense fallback={null}>
          <EmpresaMantenimientoDialog open={showEmpresaMantenimiento} onOpenChange={setShowEmpresaMantenimiento} />
        </Suspense>
      )}
      {showGestorResiduos && (
        <Suspense fallback={null}>
          <GestorResiduosDialog open={showGestorResiduos} onOpenChange={setShowGestorResiduos} />
        </Suspense>
      )}
    </div>
  );
}