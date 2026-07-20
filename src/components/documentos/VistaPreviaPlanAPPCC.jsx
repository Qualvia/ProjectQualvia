import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";

export default function VistaPreviaPlanAPPCC({ open, onOpenChange, business, onConfirmado }) {
  const { toast } = useToast();

  const [plan, setPlan] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [confirmado, setConfirmado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [diagramaAbierto, setDiagramaAbierto] = useState(null);
  const [pdfListo, setPdfListo] = useState(null);

  useEffect(() => {
    if (!open || !business) return;
    setCargando(true);
    setPlan(null);
    base44.entities.PlanAPPCCGenerado.filter({ business_id: business.id })
      .then((data) => {
        const ordenados = (data || []).slice().sort((a, b) => {
          const fa = a.fecha_generacion || "";
          const fb = b.fecha_generacion || "";
          return fb.localeCompare(fa);
        });
        setPlan(ordenados[0] || null);
      })
      .catch(() => setPlan(null))
      .finally(() => setCargando(false));
  }, [open, business]);

  const toggleDiagrama = (key) => {
    setDiagramaAbierto((prev) => (prev === key ? null : key));
  };

  const handleConfirmar = async () => {
    if (!plan) return;
    setConfirmando(true);
    try {
      const res = await base44.functions.invoke("generarPdfPlanAPPCC", { plan_id: plan.id });
      if (res?.data?.success && res?.data?.pdf_url) {
        setPdfListo(res.data.pdf_url);
        toast({ title: "Plan APPCC confirmado." });
        onConfirmado?.();
      } else {
        toast({
          title: res?.data?.error || "No se pudo generar el PDF. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: e?.response?.data?.error || e?.message || "No se pudo generar el PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setConfirmando(false);
    }
  };

  const contenido = plan?.contenido || {};
  const diagramas = contenido.diagramas || {};
  const docs = contenido.documentacion_registro || [];
  const anexo = contenido.anexo_huecos || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 rounded-2xl bg-[#FAFAF7] [&>button]:hidden">
        {/* --- Cabecera --- */}
        <div className="px-6 pt-6 pb-4 border-b border-[#EDE6DA]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#0A3E47] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-[#0A3E47] text-xl font-bold leading-tight">
                Revisión — Plan APPCC
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[#6B6B6B] leading-snug mt-0.5">
                {business?.name || ""}
                {plan?.fecha_generacion
                  ? ` · Generado el ${new Date(plan.fecha_generacion).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`
                  : ""}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* --- Cuerpo --- */}
        <div className="px-6 py-5 space-y-7 max-h-[58vh] overflow-y-auto">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#0A3E47] animate-spin" />
              <p className="text-[13px] text-[#6B6B6B] mt-3">Cargando tu Plan APPCC…</p>
            </div>
          ) : !plan ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[14px] font-medium text-[#4A4A4A]">
                No hay ningún Plan APPCC generado todavía.
              </p>
            </div>
          ) : (
            <>
              {/* Descripción de la actividad */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-2">Descripción de la actividad</h3>
                <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                  {contenido.descripcion_actividad || "—"}
                </p>
              </section>

              {/* Equipo responsable */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-2">Equipo responsable</h3>
                <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                  {contenido.equipo_responsable || "—"}
                </p>
              </section>

              {/* Diagramas de flujo */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-3">Diagramas de flujo</h3>
                <div className="space-y-2.5">
                  {Object.keys(diagramas).length === 0 && (
                    <p className="text-[13px] text-[#6B6B6B]">—</p>
                  )}
                  {Object.keys(diagramas).map((key) => {
                    const d = diagramas[key];
                    const abierto = diagramaAbierto === key;
                    return (
                      <div
                        key={key}
                        className="rounded-xl border border-[#EDE6DA] bg-white overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleDiagrama(key)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAFAF7] transition-colors"
                        >
                          <span className="text-[13px] font-semibold text-[#0A3E47]">
                            {d.nombre || key}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#0A3E47] shrink-0 transition-transform duration-200 ${
                              abierto ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {abierto && (
                          <div className="px-4 pb-4 pt-1 space-y-4 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                            {d.introduccion && (
                              <p className="text-[12px] text-[#4A4A4A] leading-relaxed">
                                {d.introduccion}
                              </p>
                            )}
                            {(d.etapas || []).map((etapa, i) => (
                              <div key={i} className="space-y-2">
                                <p className="text-[13px] font-bold text-[#1A1A1A]">
                                  Etapa: {etapa.nombre || ""}
                                </p>
                                {(etapa.peligros || []).map((p, j) => (
                                  <div key={j} className="space-y-1.5 pl-2 border-l-2 border-[#EDE6DA]">
                                    <p className="text-[12px] text-[#1A1A1A]">
                                      <span className="font-semibold">Tipo de peligro:</span>{" "}
                                      {p.tipo || "—"}
                                    </p>
                                    <p className="text-[12px] text-[#4A4A4A] leading-relaxed">
                                      {p.descripcion || "—"}
                                    </p>
                                    {p.es_pcc === true && (
                                      <div className="rounded-lg bg-[#EDE6DA] px-3 py-2.5 space-y-1">
                                        <p className="text-[12px] text-[#1A1A1A]">
                                          <span className="font-semibold">Límite crítico:</span>{" "}
                                          {p.limite_critico || "—"}
                                        </p>
                                        {p.vigilancia && (
                                          <div className="space-y-0.5">
                                            {p.vigilancia.que && (
                                              <p className="text-[12px] text-[#1A1A1A]">
                                                <span className="font-semibold">Qué:</span>{" "}
                                                {p.vigilancia.que}
                                              </p>
                                            )}
                                            {p.vigilancia.como && (
                                              <p className="text-[12px] text-[#1A1A1A]">
                                                <span className="font-semibold">Cómo:</span>{" "}
                                                {p.vigilancia.como}
                                              </p>
                                            )}
                                            {p.vigilancia.frecuencia && (
                                              <p className="text-[12px] text-[#1A1A1A]">
                                                <span className="font-semibold">Frecuencia:</span>{" "}
                                                {p.vigilancia.frecuencia}
                                              </p>
                                            )}
                                            {p.vigilancia.responsable && (
                                              <p className="text-[12px] text-[#1A1A1A]">
                                                <span className="font-semibold">Responsable:</span>{" "}
                                                {p.vigilancia.responsable}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                        <p className="text-[12px] text-[#1A1A1A]">
                                          <span className="font-semibold">Medida correctora:</span>{" "}
                                          {p.medida_correctora || "—"}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Verificación general */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-2">Verificación general</h3>
                <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                  {contenido.verificacion_general || "—"}
                </p>
              </section>

              {/* Documentación y registro */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-3">Documentación y registro</h3>
                {docs.length === 0 ? (
                  <p className="text-[13px] text-[#6B6B6B]">—</p>
                ) : (
                  <ul className="space-y-1.5">
                    {docs.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-[#1A1A1A]">
                        <span className="text-[#6BB68A] mt-0.5 shrink-0">•</span>
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Anexo — Carencias detectadas */}
              <section>
                <h3 className="text-sm font-bold text-[#0A3E47] mb-3">Anexo — Carencias detectadas</h3>
                {anexo.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl bg-[#6BB68A]/10 px-4 py-3.5">
                    <CheckCircle2 className="w-5 h-5 text-[#0A3E47] shrink-0" />
                    <p className="text-[13px] font-medium text-[#0A3E47] leading-snug">
                      No se han detectado carencias relevantes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {anexo.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-[#1A1A1A] leading-tight">
                            {h.tipo || ""}
                          </p>
                          <p className="text-[12px] text-[#4A4A4A] leading-relaxed mt-0.5">
                            {h.descripcion || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Checkbox de confirmación */}
              <section className="pt-1">
                <button
                  type="button"
                  onClick={() => setConfirmado((v) => !v)}
                  className="flex items-start gap-3 text-left w-full"
                >
                  <span
                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      confirmado
                        ? "bg-[#0A3E47] border-[#0A3E47]"
                        : "bg-white border-[#EDE6DA]"
                    }`}
                  >
                    {confirmado && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </span>
                  <span className="text-[13px] text-[#1A1A1A] leading-snug">
                    He revisado el contenido de este Plan APPCC y confirmo que refleja la actividad real de mi negocio.
                  </span>
                </button>
              </section>
            </>
          )}
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-[#EDE6DA] bg-[#FAFAF7] flex items-center justify-end gap-3">
          {pdfListo ? (
            <>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="text-[14px] font-medium text-[#6B6B6B] hover:text-[#0A3E47] transition-colors"
              >
                Cerrar
              </button>
              <Button
                onClick={() => window.open(pdfListo, "_blank")}
                className="bg-[#0A3E47] hover:bg-[#0A3E47] !text-white px-6"
              >
                Abrir PDF
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={confirmando}
                className="text-[14px] font-medium text-[#6B6B6B] hover:text-[#0A3E47] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <Button
                onClick={handleConfirmar}
                disabled={!confirmado || confirmando || !plan || cargando}
                className="bg-[#6BB68A] hover:bg-[#5aa377] !text-white px-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {confirmando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generando PDF…
                  </>
                ) : (
                  "Confirmar y generar PDF"
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}