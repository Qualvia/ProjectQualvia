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
  Check,
} from "lucide-react";

const STEPS = [
  {
    icon: Sparkles,
    title: "Bienvenida a Qualvia",
    text: "Tu aliada inteligente para el control de calidad y seguridad alimentaria. Te lo enseñamos en 1 minuto.",
    badge: "Qualvia",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "Tu punto de partida cada día. Un vistazo y sabes si todo está bajo control.",
    badge: "01",
  },
  {
    icon: ClipboardList,
    title: "Registros",
    text: "Aquí anotas tu día a día: temperaturas, limpieza, plagas, mercancías... Antes de tu primer registro, configura tus equipos y zonas en Gestionar equipos/zonas.",
    badge: "02",
  },
  {
    icon: FileText,
    title: "Documentos",
    text: "Tu plan APPCC y tus informes, listos cuando llegue una inspección.",
    badge: "03",
  },
  {
    icon: CheckSquare,
    title: "Checklist",
    text: "Tus rutinas de apertura, cierre y auditorías internas, para no dejarte nada.",
    badge: "04",
  },
  {
    icon: Bot,
    title: "Asistente",
    text: "Tu experto en seguridad alimentaria, disponible 24/7. Pregúntale lo que necesites.",
    badge: "05",
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
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3E47]/55 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", damping: 24, stiffness: 260 }}
        className="relative w-[92vw] max-w-[480px] bg-[#FAFAF7] rounded-[24px] shadow-[0_28px_80px_-16px_rgba(10,62,71,0.5)] overflow-hidden"
      >
        {/* Panel decorativo superior — arena cálida */}
        <div className="relative h-[140px] bg-gradient-to-br from-[#EDE6DA] via-[#E4DCC8] to-[#D8CFB8] overflow-hidden">
          {/* Formas decorativas */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#6BB68A]/12 blur-2xl" />
          <div className="absolute top-8 left-10 w-24 h-24 rounded-full bg-[#0A3E47]/8 blur-xl" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #0A3E47 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Badge de paso */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.7, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-5 left-6 px-3 py-1 rounded-full bg-[#0A3E47] text-[#FAFAF7] text-[11px] font-bold tracking-wider"
            >
              {current.badge}
            </motion.div>
          </AnimatePresence>

          {/* Botón X */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full flex items-center justify-center bg-[#0A3E47]/8 text-[#0A3E47]/60 hover:bg-[#0A3E47]/15 hover:text-[#0A3E47] transition-all duration-200"
            aria-label="Saltar tour"
          >
            <X className="w-4 h-4" strokeWidth={2.2} />
          </button>

          {/* Icono principal — sobresaliendo del panel */}
          <motion.div
            key={`icon-${step}`}
            initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 16, stiffness: 220, delay: 0.05 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-[18px] bg-[#0A3E47] flex items-center justify-center shadow-[0_12px_28px_-8px_rgba(10,62,71,0.45)] ring-4 ring-[#FAFAF7]"
          >
            <Icon className="w-8 h-8 text-[#6BB68A]" strokeWidth={1.7} />
          </motion.div>
        </div>

        {/* Contenido */}
        <div className="px-8 pt-14 pb-7 min-h-[230px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stagger}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex flex-col items-center text-center flex-1"
            >
              <motion.div variants={slideVariants}>
                <motion.h2
                  variants={item}
                  className="text-[23px] font-bold text-[#0A3E47] mb-2.5 tracking-tight leading-tight"
                >
                  {current.title}
                </motion.h2>
                <motion.p
                  variants={item}
                  className="text-[14px] text-[#1B1B1B]/60 leading-relaxed max-w-[350px]"
                >
                  {current.text}
                </motion.p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Progreso — dots + barra */}
          <div className="flex items-center justify-center gap-2 my-6">
            {STEPS.map((_, i) => (
              <motion.span
                key={i}
                animate={{
                  width: i === step ? 26 : 7,
                  backgroundColor:
                    i === step
                      ? "#0A3E47"
                      : i < step
                      ? "#6BB68A"
                      : "rgba(10,62,71,0.15)",
                }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="h-[7px] rounded-full"
              />
            ))}
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between">
            {!isFirst ? (
              <button
                onClick={() => go(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-semibold text-[#0A3E47]/55 hover:text-[#0A3E47] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </button>
            ) : (
              <span className="w-20" />
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => (isLast ? close() : go(step + 1))}
              className="flex items-center gap-1.5 px-7 py-3 rounded-xl bg-[#0A3E47] hover:bg-[#0d4d5a] text-white text-[13px] font-semibold transition-colors duration-200 shadow-[0_8px_20px_-6px_rgba(10,62,71,0.4)]"
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Empezar
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}