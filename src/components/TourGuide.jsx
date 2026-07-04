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
    title: "¡Empecemos!",
    text: "Tu aliada inteligente para el control de calidad y seguridad alimentaria. Te lo enseñamos en 1 minuto.",
    gradient: "from-[#6BB68A] via-[#5aa377] to-[#0A3E47]",
    glow: "rgba(107,182,138,0.45)",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "Tu punto de partida cada día. Un vistazo y sabes si todo está bajo control: tareas, incidencias y actividad reciente.",
    gradient: "from-[#6BB68A] via-[#5aa377] to-[#0A3E47]",
    glow: "rgba(107,182,138,0.45)",
  },
  {
    icon: ClipboardList,
    title: "Registros",
    text: "Anota tu día a día: temperaturas, limpieza, plagas, mercancías... Antes de tu primer registro, configura equipos y zonas en Gestionar equipos/zonas.",
    gradient: "from-[#6BB68A] via-[#5aa377] to-[#0A3E47]",
    glow: "rgba(107,182,138,0.45)",
  },
  {
    icon: FileText,
    title: "Documentos",
    text: "Tu plan APPCC y tus informes, siempre a mano y listos cuando llegue una inspección.",
    gradient: "from-[#6BB68A] via-[#5aa377] to-[#0A3E47]",
    glow: "rgba(107,182,138,0.45)",
  },
  {
    icon: CheckSquare,
    title: "Checklist",
    text: "Tus rutinas de apertura, cierre y auditorías internas, para no dejarte nada en el tintero.",
    gradient: "from-[#6BB68A] via-[#5aa377] to-[#0A3E47]",
    glow: "rgba(107,182,138,0.45)",
  },
  {
    icon: Bot,
    title: "Asistente IA",
    text: "Tu experto en seguridad alimentaria, disponible 24/7. Pregúntale lo que necesites, en cualquier momento.",
    gradient: "from-[#0A3E47] via-[#6BB68A] to-[#4a9d6e]",
    glow: "rgba(10,62,71,0.4)",
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

  const contentVariants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 48 : -48, scale: 0.95 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -48 : 48, scale: 0.95 }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A3E47]/55 backdrop-blur-md p-4"
    >
      {/* Blobs ambientales de fondo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#6BB68A]/20 blur-3xl pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#0A3E47]/25 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="relative w-[92vw] max-w-[720px] bg-[#FAFAF7] rounded-[24px] overflow-hidden shadow-[0_30px_80px_-15px_rgba(10,62,71,0.5)] grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr]"
      >
        {/* Panel izquierdo — visual */}
        <div className={`relative bg-gradient-to-br ${current.gradient} overflow-hidden flex flex-col justify-between p-7 min-h-[220px] md:min-h-[420px]`}>
          {/* Formas decorativas animadas */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -top-16 -right-16 w-44 h-44 rounded-full border border-white/15"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-12 w-52 h-52 rounded-full border border-white/10"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-8 w-3 h-3 rounded-full bg-white/40"
          />
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-16 left-10 w-2 h-2 rounded-full bg-[#6BB68A]/60"
          />

          {/* Número de paso gigante */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 1.4 }}
                animate={{ opacity: 0.18, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-[120px] md:text-[150px] font-bold text-white leading-none tracking-tighter"
              >
                {String(step + 1).padStart(2, "0")}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Icono central */}
          <div className="relative z-10 flex items-center justify-center my-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", damping: 16, stiffness: 220 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-3xl blur-2xl" style={{ backgroundColor: current.glow }} />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Icon className="w-10 h-10 md:w-11 md:h-11 text-white" strokeWidth={1.7} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Tag inferior */}
          <div className="relative z-10">
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/70">
              Qualvia · Tour
            </span>
          </div>
        </div>

        {/* Panel derecho — contenido */}
        <div className="relative p-7 md:p-8 flex flex-col min-h-[420px]">
          {/* Botón cerrar */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-[#0A3E47] hover:bg-[#0A3E47]/8 transition-all duration-200"
            aria-label="Saltar tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Barra de progreso segmentada */}
          <div className="flex items-center gap-1.5 mb-6 mt-8 pr-10">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full bg-[#0A3E47]/10 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: i < step ? "100%" : i === step ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`h-full rounded-full ${i <= step ? "bg-[#6BB68A]" : "bg-transparent"}`}
                />
              </div>
            ))}
          </div>

          {/* Contenido con transición */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#6BB68A] mb-3"
                >
                  Paso {step + 1} de {STEPS.length}
                </motion.span>
                <h2 className="text-[26px] md:text-[30px] font-bold text-[#0A3E47] mb-3 tracking-tight leading-[1.1]">
                  {current.title}
                </h2>
                <p className="text-[15px] md:text-base text-muted-foreground leading-relaxed">
                  {current.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-6">
            {!isFirst ? (
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => go(step - 1)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold text-muted-foreground hover:text-[#0A3E47] transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Atrás
              </motion.button>
            ) : (
              <span className="w-16" />
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => (isLast ? close() : go(step + 1))}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[13px] font-semibold transition-all duration-200 shadow-lg ${
                isLast
                  ? "bg-gradient-to-r from-[#6BB68A] to-[#5aa377] shadow-[#6BB68A]/40"
                  : "bg-[#0A3E47] hover:bg-[#0d4d5a] shadow-[#0A3E47]/40"
              }`}
            >
              {isLast ? (
                <>
                  ¡Vamos allá!
                  <Check className="w-4 h-4" />
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