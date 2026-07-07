import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserCog, CheckCircle2, ChevronRight, Pencil, Check, X } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";

const TOTAL_PASOS = 7;
const PASOS = [
  "Equipo y responsable",
  "Peligros del proceso",
  "Puntos de control crítico",
  "Límites críticos",
  "Vigilancia",
  "Acciones correctivas",
  "Verificación y registros",
];

export default function FormularioPlanAPPCC({ open, onOpenChange }) {
  const { user } = useBusiness();
  const { usuarioActivo } = useUsuarioInterno();

  const [pasoActual] = useState(1);

  // --- Responsable ---
  const detectado = usuarioActivo
    ? { nombre: usuarioActivo.nombre || "", rol: usuarioActivo.rol || "" }
    : { nombre: user?.full_name || "", rol: "Propietario" };

  const [editandoResponsable, setEditandoResponsable] = useState(false);
  const [responsableNombre, setResponsableNombre] = useState(detectado.nombre);
  const [responsableRol, setResponsableRol] = useState(detectado.rol);

  // --- Formación APPCC ---
  const [tieneFormacion, setTieneFormacion] = useState(null); // "si" | "no" | null
  const [detalleFormacion, setDetalleFormacion] = useState("");

  const handleSiguiente = () => {
    console.log("Paso 1 — Datos capturados:", {
      responsable: { nombre: responsableNombre, rol: responsableRol },
      formacion: { respuesta: tieneFormacion, detalle: detalleFormacion },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 rounded-2xl bg-[#F9F8F4]">
        {/* --- Barra de progreso superior --- */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E8E2D9]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-[#4A4A4A]">
              Paso {pasoActual} de {TOTAL_PASOS}
            </span>
            <span className="text-[13px] font-medium text-[#4A4A4A]">
              {PASOS[pasoActual - 1]}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E8E2D9] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0D3B3E] transition-all duration-700 ease-out"
              style={{ width: `${(pasoActual / TOTAL_PASOS) * 100}%` }}
            />
          </div>
        </div>

        {/* --- Cabecera del documento --- */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D3B3E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-[#0D3B3E] text-xl font-bold leading-tight">
                Formulario previo — Plan APPCC
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-[13px] text-[#6B6B6B] leading-relaxed">
            Para dejar tu Plan APPCC bien afinado, necesitamos confirmar algunos datos reales de tu
            negocio. Lo que ya sabemos por tus registros no te lo volveremos a preguntar.
          </DialogDescription>
        </div>

        {/* --- Cuerpo con slide --- */}
        <div className="px-6 py-5 space-y-6 max-h-[52vh] overflow-y-auto">
          <div key={pasoActual} className="animate-in fade-in-0 slide-in-from-right-4 duration-500 space-y-6">
            {/* Sección: Equipo y responsable */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#E8E2D9] flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4 text-[#0D3B3E]" />
                </div>
                <h3 className="text-sm font-bold text-[#0D3B3E]">Equipo y responsable</h3>
              </div>

              {/* Alert box / editable */}
              {!editandoResponsable ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#BDE3D8] bg-[#E7F6F2] px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-[#0D3B3E] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#0D3B3E] leading-tight">
                        Responsable detectado desde tu equipo
                      </p>
                      <p className="text-[12px] text-[#4A4A4A] truncate">
                        {responsableNombre || "Sin nombre"} · {responsableRol}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditandoResponsable(true)}
                    className="shrink-0 px-3.5 py-1.5 rounded-full border border-[#0D3B3E] text-[12px] font-semibold text-[#0D3B3E] hover:bg-[#0D3B3E] hover:text-white transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-[#E8E2D9] bg-white px-4 py-4 space-y-3 animate-in fade-in-0 duration-300">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#6B6B6B]">Nombre del responsable</Label>
                    <Input
                      value={responsableNombre}
                      onChange={(e) => setResponsableNombre(e.target.value)}
                      placeholder="Ej. María García"
                      autoFocus
                      className="border-[#E8E2D9] focus-visible:ring-[#0D3B3E]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-[#6B6B6B]">Rol / cargo</Label>
                    <Input
                      value={responsableRol}
                      onChange={(e) => setResponsableRol(e.target.value)}
                      placeholder="Ej. Gerente, Técnico de calidad…"
                      className="border-[#E8E2D9] focus-visible:ring-[#0D3B3E]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditandoResponsable(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0D3B3E] text-white text-[12px] font-semibold hover:bg-[#0d4d5a] transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirmar
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Sección: Formación APPCC */}
            <section>
              <p className="text-[14px] font-bold text-[#1A1A1A] leading-snug mb-4">
                ¿Alguien del equipo tiene formación específica en APPCC, o contáis con asesoría
                externa?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTieneFormacion("si")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tieneFormacion === "si"
                      ? "bg-[#0D3B3E] text-white border-2 border-[#0D3B3E]"
                      : "bg-white text-[#0D3B3E] border-2 border-[#0D3B3E] hover:bg-[#0D3B3E]/5"
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setTieneFormacion("no")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    tieneFormacion === "no"
                      ? "bg-[#0D3B3E] text-white border-2 border-[#0D3B3E]"
                      : "bg-white text-[#0D3B3E] border-2 border-[#0D3B3E] hover:bg-[#0D3B3E]/5"
                  }`}
                >
                  No
                </button>
              </div>

              {tieneFormacion && (
                <div className="mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-400">
                  <Input
                    value={detalleFormacion}
                    onChange={(e) => setDetalleFormacion(e.target.value)}
                    placeholder="Opcional: nombre de la persona o de la asesoría"
                    className="border-[#E8E2D9] focus-visible:ring-[#0D3B3E]"
                  />
                </div>
              )}
            </section>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="px-6 py-4 border-t border-[#E8E2D9] bg-[#F9F8F4] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-[14px] font-medium text-[#6B6B6B] hover:text-[#0D3B3E] transition-colors"
          >
            Cancelar
          </button>
          <Button
            onClick={handleSiguiente}
            className="bg-[#75A986] hover:bg-[#659974] !text-white px-6"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}