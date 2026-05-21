import React, { useState } from "react";
import { BarChart2, FileSpreadsheet, Download, ChevronDown, Check } from "lucide-react";

const PERIODOS = [
  { id: "semanal", label: "Semanal (última semana)" },
  { id: "mensual", label: "Mensual (mes actual)" },
  { id: "semestral", label: "Semestral (últimos 6 meses)" },
  { id: "anual", label: "Anual (último año)" },
  { id: "personalizado", label: "Personalizado" },
];

const TIPOS_REGISTRO = [
  { id: "temperatura", label: "Control de Temperatura" },
  { id: "limpieza", label: "Control de Limpieza" },
  { id: "recepcion", label: "Control de Recepción" },
  { id: "agua", label: "Control de Agua" },
  { id: "plagas", label: "Control de Plagas" },
  { id: "mantenimiento", label: "Control de Mantenimiento" },
  { id: "congelacion", label: "Control de Congelación" },
  { id: "alergenos", label: "Control de Alérgenos" },
  { id: "residuos", label: "Gestión de Residuos" },
  { id: "lotes", label: "Trazabilidad de Lotes" },
  { id: "formacion", label: "Formación del Personal" },
  { id: "incidencias", label: "Incidencias" },
];

export default function TabInformes() {
  const [periodo, setPeriodo] = useState("mensual");
  const [showPeriodoDropdown, setShowPeriodoDropdown] = useState(false);
  const [selectedTipos, setSelectedTipos] = useState(
    Object.fromEntries(TIPOS_REGISTRO.map((t) => [t.id, true]))
  );
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const periodoLabel = PERIODOS.find((p) => p.id === periodo)?.label || "";
  const allSelected = Object.values(selectedTipos).every(Boolean);

  function toggleTipo(id) {
    setSelectedTipos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function deseleccionarTodos() {
    setSelectedTipos(Object.fromEntries(TIPOS_REGISTRO.map((t) => [t.id, false])));
  }

  function seleccionarTodos() {
    setSelectedTipos(Object.fromEntries(TIPOS_REGISTRO.map((t) => [t.id, true])));
  }

  // Botones de acción (sin implementación de generación por ahora)
  function handleGenerarPDF() { /* pendiente */ }
  function handleExportarExcel() { /* pendiente */ }

  // Dividir tipos en dos columnas
  const col1 = TIPOS_REGISTRO.filter((_, i) => i % 2 === 0);
  const col2 = TIPOS_REGISTRO.filter((_, i) => i % 2 !== 0);

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A3E47] to-[#6BB68A] p-6 relative">
        <div className="absolute right-6 top-4 opacity-10">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
            <path d="M80 10 L150 110 L10 110 Z" fill="white" />
          </svg>
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg mb-1">Informes de Control y Análisis</p>
            <p className="text-white/85 text-sm leading-relaxed">
              Crea reportes detallados de tus registros para inspecciones o auditorías. Analiza tendencias, detecta
              incidencias recurrentes y demuestra el control efectivo de tu seguridad alimentaria.
            </p>
          </div>
        </div>
      </div>

      {/* Sección generador */}
      <div className="rounded-2xl overflow-hidden border border-border">
        {/* Cabecera sección */}
        <div className="bg-secondary px-5 py-4 flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-[#0A3E47]" />
          <span className="font-semibold text-[#0A3E47]">Generar Informe de Registros</span>
        </div>

        <div className="bg-white p-5 space-y-6">
          {/* Período */}
          <div>
            <p className="font-bold text-foreground mb-3">Período del informe</p>
            <div className="relative">
              <button
                onClick={() => setShowPeriodoDropdown((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-input bg-white text-sm text-foreground hover:border-[#6BB68A] transition-colors"
              >
                {periodoLabel}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>
              {showPeriodoDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
                  {PERIODOS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setPeriodo(opt.id); setShowPeriodoDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors flex items-center justify-between"
                    >
                      {opt.label}
                      {periodo === opt.id && <Check className="w-4 h-4 text-[#6BB68A]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fechas personalizadas */}
            {periodo === "personalizado" && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Desde</label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tipos de registro */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-foreground">Tipos de registros a incluir</p>
              <button
                onClick={allSelected ? deseleccionarTodos : seleccionarTodos}
                className="text-sm font-medium text-[#6BB68A] hover:text-[#5aa377] transition-colors"
              >
                {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {[col1, col2].map((col, ci) => (
                <div key={ci} className="space-y-3">
                  {col.map((tipo) => (
                    <label key={tipo.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleTipo(tipo.id)}
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                          selectedTipos[tipo.id]
                            ? "bg-[#0A3E47] border-[#0A3E47]"
                            : "bg-white border-border group-hover:border-[#0A3E47]"
                        }`}
                      >
                        {selectedTipos[tipo.id] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-sm text-foreground">{tipo.label}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="bg-white border-t border-border px-5 py-4 grid grid-cols-2 gap-3">
          <button
            onClick={handleExportarExcel}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#6BB68A] text-[#6BB68A] font-semibold text-sm hover:bg-[#6BB68A]/5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar Excel
          </button>
          <button
            onClick={handleGenerarPDF}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0A3E47] hover:bg-[#0d4f5c] text-white font-semibold text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
}