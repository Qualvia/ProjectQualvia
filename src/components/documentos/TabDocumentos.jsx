import React from "react";
import { ShieldCheck, ClipboardList, BookOpen, Award, Sparkles, BarChart3, Download } from "lucide-react";

const DOCUMENTOS = [
  {
    id: "appcc",
    title: "Plan APPCC",
    desc: "Plan de Análisis de Peligros y Puntos de Control Crítico",
    icon: ShieldCheck,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
  {
    id: "limpieza",
    title: "Plan de Limpieza",
    desc: "Protocolo de limpieza y desinfección completo",
    icon: ClipboardList,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
  {
    id: "plagas",
    title: "Plan de Control de Plagas",
    desc: "Procedimientos y gestión del control de plagas",
    icon: BookOpen,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
  {
    id: "sanidad",
    title: "Dossier Inspección de Sanidad",
    desc: "Documentación preparada para inspección sanitaria",
    icon: Award,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
  {
    id: "seguridad",
    title: "Informe Inteligente de Seguridad Alimentaria",
    desc: "Análisis IA de riesgos y estado de seguridad",
    icon: Sparkles,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
  {
    id: "incidencias",
    title: "Informe de Incidencias y No Conformidades",
    desc: "Análisis detallado de incidencias con patrones y recomendaciones",
    icon: BarChart3,
    iconBg: "bg-secondary",
    iconColor: "text-[#0A3E47]",
    btnColor: "bg-[#0A3E47] hover:bg-[#0d4f5c] !text-white",
  },
];

export default function TabDocumentos() {
  return (
    <div className="space-y-6">
      {/* Banner informativo */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0A3E47] to-[#6BB68A] p-6 relative">
        {/* Decorative shape */}
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
            <p className="font-bold text-white text-lg mb-1">Documentación Técnica</p>
            <p className="text-white/85 text-sm leading-relaxed">
              Genera documentos profesionales de seguridad alimentaria con IA: planes APPCC, protocolos de
              limpieza, control de plagas, dossiers de inspección e informes de análisis. La IA utiliza tus datos reales
              para crear documentación específica y adaptada a tu establecimiento. Revisa y ajusta el contenido
              antes de su uso oficial.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCUMENTOS.map((doc) => {
          const Icon = doc.icon;
          return (
            <div key={doc.id} className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl ${doc.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-7 h-7 ${doc.iconColor}`} />
                </div>
                <div>
                  <p className="font-bold text-[#0A3E47] text-base leading-tight mb-1">{doc.title}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{doc.desc}</p>
                </div>
              </div>
              <button
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${doc.btnColor}`}
                onClick={() => {/* generación pendiente */}}
              >
                <Download className="w-4 h-4" />
                Generar PDF
              </button>
            </div>
          );
        })}
      </div>

      {/* Aviso legal */}
      <div className="bg-secondary border border-border rounded-2xl px-5 py-4 flex items-start gap-3">
        <span className="text-lg shrink-0">ℹ️</span>
        <p className="text-sm text-foreground">
          <span className="font-bold">Qualvia es una herramienta de apoyo</span> para la gestión de la seguridad alimentaria. Los documentos generados deben ser revisados y adaptados por un profesional antes de su uso oficial.
        </p>
      </div>
    </div>
  );
}