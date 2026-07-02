import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Sparkles,
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckSquare,
  Bot,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenida a Qualvia",
    text: "Tu aliada inteligente para el control de calidad y seguridad alimentaria. Te lo enseñamos en 1 minuto.",
    accent: "from-[#6BB68A] to-[#5aa377]",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "Tu punto de partida cada día. Un vistazo y sabes si todo está bajo control.",
    accent: "from-[#0A3E47] to-[#0d4d5a]",
  },
  {
    icon: ClipboardList,
    title: "Registros",
    text: "Aquí anotas tu día a día: temperaturas, limpieza, plagas, mercancías... Antes de tu primer registro, configura tus equipos y zonas en Gestionar equipos/zonas.",
    accent: "from-[#6BB68A] to-[#4a9d6e]",
  },
  {
    icon: FileText,
    title: "Documentos",
    text: "Tu plan APPCC y tus informes, listos cuando llegue una inspección.",
    accent: "from-[#0A3E47] to-[#125968]",
  },
  {
    icon: CheckSquare,
    title: "Checklist",
    text: "Tus rutinas de apertura, cierre y auditorías internas, para no dejarte nada.",
    accent: "from-[#6BB68A] to-[#5aa377]",
  },
  {
    icon: Bot,
    title: "Asistente",
    text: "Tu experto en seguridad alimentaria, disponible 24/7. Pregúntale lo que necesites.",
    accent: "from-[#0A3E47] to-[#0d4d5a]",
  },
];

export default function TourGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  function go(next) {
    if (next < 0 || next >= STEPS.length) return;
    setDirection(next > step ? 1 : -1);
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

  const slideVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40, scale: 0.96 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3E47]/50 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: "spring", damping: 26, stiffness: 280 }}
        className="relative w-[90vw] max-w-[460px] bg-[#FAFAF7] rounded-[20px] shadow-[0_24px_70px_-12px_rgba(10,62,71,0.45)] overflow-hidden"
      >
        {/* Barra de progreso superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0A3E47]/8 z-20">
          <motion.div
            className="h-full bg-[#6BB68A]"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Botón X para saltar */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/70 hover:text-[#0A3E47] hover:bg-[#0A3E47]/8 transition-all duration-200"
          aria-label="Saltar tour"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contenido con transición */}
        <div className="px-8 pt-9 pb-7 min-h-[340px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center text-center flex-1"
            >
              {/* Icono */}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: "spring", damping: 18, stiffness: 260 }}
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.accent} flex items-center justify-center mb-5 shadow-lg`}
                style={{ boxShadow: "0 10px 24px -6px rgba(10,62,71,0.3)" }}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={1.8} />
              </motion.div>

              {/* Step counter */}
              <span className="text-[11px] font-semibold tracking-widest uppercase text-[#6BB68A] mb-2">
                Paso {step + 1} de {STEPS.length}
              </span>

              {/* Título */}
              <h2 className="text-[22px] font-bold text-[#0A3E47] mb-2.5 tracking-tight leading-tight">
                {current.title}
              </h2>

              {/* Texto */}
              <p className="text-[14px] text-muted-foreground leading-relaxed max-w-[340px]">
                {current.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots de progreso */}
          <div className="flex items-center justify-center gap-2 my-6">
            {STEPS.map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === step ? 22 : 7,
                  backgroundColor: i === step ? "#0A3E47" : "rgba(10,62,71,0.2)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-[7px] rounded-full"
              />
            ))}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold text-muted-foreground hover:text-[#0A3E47] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <span className="w-20" />
            )}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (isLast ? close() : go(step + 1))}
              className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#0A3E47] hover:bg-[#0d4d5a] text-white text-[13px] font-semibold transition-colors duration-200 shadow-md"
            >
              {isLast ? "Empezar" : "Siguiente"}
              {isLast ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}