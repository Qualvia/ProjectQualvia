import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Sparkles, Send, Thermometer, ClipboardList, AlertTriangle, Brush, Leaf, BarChart3 } from "lucide-react";

const SUGERENCIAS = [
  { icon: Thermometer, texto: "¿Cómo mejorar el control de temperatura?" },
  { icon: ClipboardList, texto: "¿Qué documentación necesito para una inspección?" },
  { icon: AlertTriangle, texto: "Resumen de incidencias recientes" },
  { icon: Brush, texto: "Frecuencia de limpieza recomendada" },
  { icon: Leaf, texto: "¿Cómo gestionar correctamente los alérgenos?" },
  { icon: BarChart3, texto: "Resumen de registros últimos 15 días" },
];

function detectarIntencion(texto) {
  const t = texto.toLowerCase();
  if (t.includes("temperatura") || t.includes("registro")) return "registros";
  if (t.includes("incidencia") || t.includes("problema")) return "incidencias";
  if (t.includes("semana") || t.includes("mes") || t.includes("cómo vamos")) return "resumen";
  return "general";
}

const QUALVIA_AVATAR = "https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/4bfbe29ea_IconJPEG01-01.jpg";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
        <img src={QUALVIA_AVATAR} alt="QUALVIA" className="w-full h-full object-cover" />
      </div>
      <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-2 h-2 bg-[#6BB68A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-[#6BB68A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-[#6BB68A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function Mensaje({ msg }) {
  const esUsuario = msg.role === "user";
  return (
    <div className={`flex items-end gap-2 mb-4 ${esUsuario ? "flex-row-reverse" : ""}`}>
      {!esUsuario && (
        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-border">
          <img src={QUALVIA_AVATAR} alt="QUALVIA" className="w-full h-full object-cover" />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
          esUsuario
            ? "bg-[#0A3E47] text-white rounded-br-sm"
            : "bg-white border border-border text-foreground rounded-bl-sm"
        }`}
        style={{ animation: "fadeInMsg 0.2s ease-out" }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function Asistente() {
  const { currentBusiness, user } = useBusiness();
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(true);
  const [memoriaId, setMemoriaId] = useState(null);
  const [memoriaPrevia, setMemoriaPrevia] = useState(null);
  const [contextNegocio, setContextNegocio] = useState(null);
  const scrollRef = useRef(null);
  const inactividadTimer = useRef(null);
  const mensajesRef = useRef(mensajes);
  mensajesRef.current = mensajes;

  // Scroll al fondo
  const scrollAbajo = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  // Guardar resumen en memoria
  const guardarResumen = useCallback(async () => {
    const msgs = mensajesRef.current.filter(m => m.role !== "system");
    if (!currentBusiness || !user || msgs.length < 2) return;
    const res = await base44.functions.invoke("guardarResumenAsistente", {
      mensajes: msgs,
      business_id: currentBusiness.id,
      user_id: user.id,
    });
    if (res?.data?.ok && res?.data?.resumen) {
      const datos = {
        business_id: currentBusiness.id,
        user_id: user.id,
        resumen: res.data.resumen,
        fecha: new Date().toISOString(),
      };
      if (memoriaId) {
        await base44.entities.AsistenteMemoria.update(memoriaId, datos);
      } else {
        const nuevo = await base44.entities.AsistenteMemoria.create(datos);
        setMemoriaId(nuevo.id);
      }
    }
  }, [currentBusiness, user, memoriaId]);

  // Reiniciar timer de inactividad
  const resetInactividad = useCallback(() => {
    if (inactividadTimer.current) clearTimeout(inactividadTimer.current);
    inactividadTimer.current = setTimeout(() => {
      guardarResumen();
    }, 3 * 60 * 1000);
  }, [guardarResumen]);

  // Cargar contexto y memoria al montar
  useEffect(() => {
    if (!currentBusiness || !user) return;

    async function init() {
      // Cargar perfil del negocio
      const perfiles = await base44.entities.BusinessProfile.filter({ business_id: currentBusiness.id });
      const perfil = perfiles[0] || {};
      setContextNegocio({
        nombre: currentBusiness.name || "",
        tipo_negocio: perfil.tipo_negocio || "",
        ciudad: perfil.ciudad || "",
        comunidad_autonoma: perfil.comunidad_autonoma || "",
      });

      // Cargar memoria previa
      const memorias = await base44.entities.AsistenteMemoria.filter({
        business_id: currentBusiness.id,
        user_id: user.id,
      });
      if (memorias.length > 0) {
        setMemoriaId(memorias[0].id);
        setMemoriaPrevia(memorias[0].resumen);
      }

      // Mensaje de bienvenida
      const nombreNegocio = currentBusiness.name || "tu negocio";
      setMensajes([{
        role: "assistant",
        content: `¡Hola! 👋 Soy QUALVIA, tu asistente especializada en calidad y seguridad alimentaria. Veo que estás gestionando ${nombreNegocio} — estoy aquí para ayudarte con todo lo que necesites: normativa APPCC, control de registros, preparación de inspecciones o cualquier duda operativa. ¿En qué puedo ayudarte hoy?`,
      }]);
    }

    init();

    return () => {
      if (inactividadTimer.current) clearTimeout(inactividadTimer.current);
      guardarResumen();
    };
  }, [currentBusiness?.id, user?.id]);

  useEffect(() => {
    scrollAbajo();
  }, [mensajes, cargando]);

  async function enviar(texto) {
    const textoFinal = texto || input.trim();
    if (!textoFinal || cargando) return;

    setInput("");
    setMostrarSugerencias(false);

    const nuevosMensajes = [...mensajes, { role: "user", content: textoFinal }];
    setMensajes(nuevosMensajes);
    setCargando(true);
    resetInactividad();

    const historial = nuevosMensajes
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.content }));

    const res = await base44.functions.invoke("llamarAsistente", {
      business_id: currentBusiness?.id,
      mensajes: historial,
      contexto_negocio: contextNegocio,
      memoria_previa: memoriaPrevia,
      intencion: detectarIntencion(textoFinal),
    });

    const respuesta = res?.data?.respuesta || "Lo siento, no pude procesar tu consulta en este momento.";
    setMensajes(prev => [...prev, { role: "assistant", content: respuesta }]);
    setCargando(false);
    resetInactividad();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  return (
    <>
      <style>{`
        @keyframes fadeInMsg {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="flex flex-col h-full bg-[#FAFAF7]">
        {/* Header fijo */}
        <div className="bg-white border-b border-border px-5 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#0A3E47] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#0A3E47] text-base leading-none">Asistente IA</p>
            <p className="text-[#6BB68A] text-xs font-medium mt-0.5">Tu experto en calidad alimentaria 24/7</p>
          </div>
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-semibold text-green-700">En línea</span>
          </div>
        </div>

        {/* Área de mensajes */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="max-w-3xl mx-auto">
            {mensajes.map((msg, i) => (
              <Mensaje key={i} msg={msg} />
            ))}



            {cargando && <TypingIndicator />}
          </div>
        </div>

        {/* Input fijo abajo */}
        <div className="bg-white border-t border-border px-4 pt-3 pb-2 shrink-0">
          {mostrarSugerencias && (
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {SUGERENCIAS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() => enviar(s.texto)}
                    className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-left text-xs text-foreground hover:bg-green-100 hover:border-green-300 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5 text-[#6BB68A] shrink-0" />
                    <span className="leading-snug">{s.texto}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={cargando}
              placeholder="Escribe tu pregunta aquí..."
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:border-[#6BB68A] bg-[#FAFAF7] disabled:opacity-60"
            />
            <button
              onClick={() => enviar()}
              disabled={cargando || !input.trim()}
              className="w-10 h-10 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">QUALVIA es una herramienta de apoyo basada en IA. No sustituye asesoramiento oficial.</p>
        </div>
      </div>
    </>
  );
}