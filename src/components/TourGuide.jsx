import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckSquare,
  Bot,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenida a Qualvia",
    text: "Tu aliada inteligente para el control de calidad y seguridad alimentaria. Te lo enseñamos en 1 minuto.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "Tu punto de partida cada día. Un vistazo y sabes si todo está bajo control.",
  },
  {
    icon: ClipboardList,
    title: "Registros",
    text: "Aquí anotas tu día a día: temperaturas, limpieza, plagas, mercancías... Antes de tu primer registro, configura tus equipos y zonas en Gestionar equipos/zonas.",
  },
  {
    icon: FileText,
    title: "Documentos",
    text: "Tu plan APPCC y tus informes, listos cuando llegue una inspección.",
  },
  {
    icon: CheckSquare,
    title: "Checklist",
    text: "Tus rutinas de apertura, cierre y auditorías internas, para no dejarte nada.",
  },
  {
    icon: Bot,
    title: "Asistente",
    text: "Tu experto en seguridad alimentaria, disponible 24/7. Pregúntale lo que necesites.",
  },
];

export default function TourGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("next");

  function go(next) {
    setDirection(next > step ? "next" : "prev");
    setStep(next);
  }

  function close() {
    onClose();
    base44.auth.updateMe({ tour_completado: true }).catch((e) => console.error(e));
  }

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3E47]/40 backdrop-blur-sm p-4">
      <div className="relative w-[90vw] max-w-[440px] bg-[#FAFAF7] rounded-2xl shadow-2xl overflow-hidden">
        {/* Botón X para saltar */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors"
          aria-label="Saltar tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenido con transición */}
        <div className="p-7 pt-8">
          <div
            key={step}
            className="flex flex-col items-center text-center"
            style={{
              animation: `${direction === "next" ? "tour-slide-next" : "tour-slide-prev"} 220ms ease-out`,
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#6BB68A] flex items-center justify-center mb-4">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#0A3E47] mb-2">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed min-h-[60px]">{current.text}</p>
          </div>

          {/* Dots de progreso */}
          <div className="flex items-center justify-center gap-1.5 my-5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-[#0A3E47]" : "w-1.5 bg-[#0A3E47]/25"
                }`}
              />
            ))}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={() => (isLast ? close() : go(step + 1))}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-[#0A3E47] hover:bg-[#0A3E47]/90 text-white text-sm font-semibold transition-colors"
            >
              {isLast ? "Empezar" : "Siguiente"}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tour-slide-next {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes tour-slide-prev {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}