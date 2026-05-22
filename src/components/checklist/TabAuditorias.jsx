import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { ClipboardList, UtensilsCrossed, Factory, Search, FileDown, Loader2, CalendarDays, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AuditoriaRestauranteForm from "./AuditoriaRestauranteForm";
import AuditoriaObradorForm from "./AuditoriaObradorForm";

const TIPO_CONFIG = {
  restaurante: {
    label: "Restaurante",
    sublabel: "Hostelería general",
    icon: UtensilsCrossed,
    color: "text-[#0A3E47]",
    border: "border-[#0A3E47]",
  },
  industria_obrador: {
    label: "Industria / Obrador",
    sublabel: "Obradores y producción",
    icon: Factory,
    color: "text-[#0A3E47]",
    border: "border-[#0A3E47]",
  },
};

function PuntuacionColor({ puntuacion }) {
  if (puntuacion === 100) return "text-[#2d8a5e]";
  if (puntuacion >= 75) return "text-yellow-600";
  return "text-red-500";
}

export default function TabAuditorias({ onIniciarAuditoria }) {
  const { currentBusiness, user } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todo");
  const [filtroResultado, setFiltroResultado] = useState("todos");
  const [formularioActivo, setFormularioActivo] = useState(null); // "restaurante" | "industria_obrador" | null
  const [expandedId, setExpandedId] = useState(null);

  async function cargar() {
    if (!currentBusiness) return;
    const data = await base44.entities.AuditoriaInterna.filter(
      { business_id: currentBusiness.id },
      "-fecha",
      50
    );
    setAuditorias(data);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    cargar();
  }, [currentBusiness]);

  const filtradas = useMemo(() => {
    return auditorias.filter((a) => {
      if (filtroTipo !== "todo" && a.tipo !== filtroTipo) return false;
      if (filtroResultado === "cumple" && a.puntuacion < 75) return false;
      if (filtroResultado === "no_cumple" && a.puntuacion >= 75) return false;
      if (busqueda) {
        const q = busqueda.toLowerCase();
        if (
          !a.auditor?.toLowerCase().includes(q) &&
          !(TIPO_CONFIG[a.tipo]?.label || "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [auditorias, filtroTipo, filtroResultado, busqueda]);

  const ultimaFecha = auditorias[0]?.fecha ? format(new Date(auditorias[0].fecha), "d MMM yyyy", { locale: es }) : null;

  if (formularioActivo === "restaurante") {
    return (
      <AuditoriaRestauranteForm
        onCancel={() => setFormularioActivo(null)}
        onGuardado={() => { setFormularioActivo(null); cargar(); }}
      />
    );
  }

  if (formularioActivo === "industria_obrador") {
    return (
      <AuditoriaObradorForm
        onCancel={() => setFormularioActivo(null)}
        onGuardado={() => { setFormularioActivo(null); cargar(); }}
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
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg mb-1">Auditorías Internas: Tu herramienta de mejora</p>
            <p className="text-white/85 text-sm leading-relaxed">
              Las auditorías internas permiten autoevaluar el estado real de tu negocio frente a normativas y estándares de calidad. Realizarlas periódicamente te ayuda a detectar desviaciones a tiempo, preparar a tu equipo para inspecciones oficiales y garantizar la excelencia operativa y seguridad alimentaria.
            </p>
          </div>
        </div>
      </div>

      {/* Selector de tipo + contador */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Selector */}
        <div className="md:col-span-2 bg-white border border-border rounded-2xl p-4">
          <h2 className="text-lg font-bold text-[#0A3E47] mb-0.5">Auditorías Internas</h2>
          <p className="text-xs text-[#0A3E47] font-medium mb-3">Selecciona el tipo de auditoría para comenzar la evaluación:</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFormularioActivo(key)}
                  className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors shadow-sm border border-border"
                >
                  <Icon className="w-6 h-6 text-[#0A3E47]" />
                  <span className="font-bold text-sm text-[#0A3E47]">{cfg.label}</span>
                  <span className="text-xs text-muted-foreground">{cfg.sublabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contador */}
        <div className="bg-white border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <p className="text-5xl font-bold text-[#0A3E47] mb-1">{auditorias.length}</p>
          <p className="text-sm font-semibold text-foreground">Auditorías Realizadas</p>
          {ultimaFecha && (
            <p className="text-xs text-muted-foreground mt-1">Última: {ultimaFecha}</p>
          )}
        </div>
      </div>

      {/* Historial */}
      <div>
        {/* Cabecera historial */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-xl font-bold text-foreground flex-1">Historial de Auditorías</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="h-9 pl-9 pr-3 rounded-lg border border-border text-sm focus:outline-none focus:border-[#6BB68A] bg-white w-44"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A] bg-white"
          >
            <option value="todo">Todo</option>
            <option value="restaurante">Restaurante</option>
            <option value="industria_obrador">Industria / Obrador</option>
          </select>
          <select
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value)}
            className="h-9 rounded-lg border border-border px-3 text-sm focus:outline-none focus:border-[#6BB68A] bg-white"
          >
            <option value="todos">Todos</option>
            <option value="cumple">Cumple</option>
            <option value="no_cumple">No cumple</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No hay auditorías registradas todavía.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map((a) => {
              const cfg = TIPO_CONFIG[a.tipo] || {};
              const borderColor = a.puntuacion === 100 ? "border-l-[#6BB68A]" : a.puntuacion >= 75 ? "border-l-yellow-400" : "border-l-red-400";
              const punColor = PuntuacionColor({ puntuacion: a.puntuacion });
              const expanded = expandedId === a.id;
              return (
                <div key={a.id} className={`bg-white rounded-2xl border border-border border-l-4 ${borderColor} overflow-hidden`}>
                  {/* Cabecera clicable */}
                  <div
                    className="px-5 py-4 flex flex-wrap items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(expanded ? null : a.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-base">Auditoría interna {cfg.label}</p>
                      <p className="text-sm text-muted-foreground">Auditor: {a.auditor || "—"}</p>
                    </div>
                    {a.fecha && (
                      <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2 text-sm text-foreground shrink-0">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {format(new Date(a.fecha), "d MMM yyyy - HH:mm", { locale: es })}
                      </div>
                    )}
                    <div className="text-center shrink-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cumplimiento</p>
                      <p className={`text-2xl font-bold ${punColor}`}>{a.puntuacion ?? "—"}%</p>
                    </div>
                    {a.puntuacion === 100 && <CheckCircle2 className="w-6 h-6 text-[#6BB68A] shrink-0" />}
                    {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />}
                  </div>

                  {/* Detalle expandible */}
                  {expanded && (
                    <div className="border-t border-border px-5 py-4 space-y-4">
                      {(a.secciones || []).map((sec, si) => (
                        <div key={si}>
                          <p className="font-bold text-sm text-[#0A3E47] mb-2">{sec.nombre}</p>
                          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                            {(sec.items || []).map((item, ii) => (
                              <div key={ii} className="flex items-center gap-3 px-4 py-2.5">
                                {item.estado === "cumple" && (
                                  <span className="w-5 h-5 rounded-full bg-[#6BB68A] flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                                  </span>
                                )}
                                {item.estado === "no_cumple" && (
                                  <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                  </span>
                                )}
                                {item.estado === "na" && (
                                  <span className="w-5 h-5 rounded-full border-2 border-border shrink-0" />
                                )}
                                <p className="text-sm text-foreground">{item.pregunta}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {a.observaciones_generales && (
                        <div className="p-3 bg-secondary rounded-xl">
                          <p className="text-xs font-semibold text-foreground mb-1">Observaciones:</p>
                          <p className="text-sm text-muted-foreground">{a.observaciones_generales}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}