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
import { ShieldCheck, UserCog, GraduationCap, ChevronRight, Pencil, Check } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";

const TOTAL_PASOS = 7;

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

  const handleCancelar = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        {/* Cabecera con degradado */}
        <div className="bg-gradient-to-br from-[#0A3E47] to-[#0d4d5a] px-6 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-bold leading-tight">
                Generar Plan APPCC
              </DialogTitle>
              <DialogDescription className="text-white/75 text-sm">
                Completa la información paso a paso para generar tu documento.
              </DialogDescription>
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#6BB68A] transition-all duration-500"
                style={{ width: `${(pasoActual / TOTAL_PASOS) * 100}%` }}
              />
            </div>
            <span className="text-white/80 text-xs font-medium tabular-nums shrink-0">
              Paso {pasoActual} de {TOTAL_PASOS}
            </span>
          </div>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-6 space-y-7 max-h-[60vh] overflow-y-auto">
          {/* Sección: Equipo y responsable */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <UserCog className="w-4 h-4 text-[#0A3E47]" />
              <h3 className="text-sm font-bold text-[#0A3E47]">Equipo y responsable</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Hemos detectado al responsable a partir de tu sesión. Puedes editarlo si lo necesitas.
            </p>

            <div className="rounded-xl border border-border bg-[#FAFAF7] p-4">
              {!editandoResponsable ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Responsable
                    </Label>
                    <p className="font-semibold text-[#0A3E47] text-sm leading-tight truncate">
                      {responsableNombre || "Sin nombre"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{responsableRol}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#0A3E47] hover:bg-[#0A3E47]/8 shrink-0"
                    onClick={() => setEditandoResponsable(true)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nombre del responsable</Label>
                    <Input
                      value={responsableNombre}
                      onChange={(e) => setResponsableNombre(e.target.value)}
                      placeholder="Ej. María García"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Rol / cargo</Label>
                    <Input
                      value={responsableRol}
                      onChange={(e) => setResponsableRol(e.target.value)}
                      placeholder="Ej. Gerente, Técnico de calidad…"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6BB68A] hover:bg-[#6BB68A]/10 shrink-0"
                    onClick={() => setEditandoResponsable(false)}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirmar
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sección: Formación APPCC */}
          <section>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-[#0A3E47]" />
              <h3 className="text-sm font-bold text-[#0A3E47]">Formación en APPCC</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              ¿Alguien del equipo tiene formación específica en APPCC o contáis con asesoría externa?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTieneFormacion("si")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  tieneFormacion === "si"
                    ? "border-[#6BB68A] bg-[#6BB68A]/10 text-[#0A3E47]"
                    : "border-border bg-white text-muted-foreground hover:border-[#6BB68A]/50"
                }`}
              >
                Sí
              </button>
              <button
                type="button"
                onClick={() => setTieneFormacion("no")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  tieneFormacion === "no"
                    ? "border-[#6BB68A] bg-[#6BB68A]/10 text-[#0A3E47]"
                    : "border-border bg-white text-muted-foreground hover:border-[#6BB68A]/50"
                }`}
              >
                No
              </button>
            </div>

            {tieneFormacion && (
              <div className="mt-4 space-y-1.5 animate-in fade-in-0 duration-300">
                <Label className="text-xs text-muted-foreground">
                  {tieneFormacion === "si"
                    ? "Indica el nombre de la persona o asesoría (opcional)"
                    : "¿Planeas contratar asesoría externa? (opcional)"}
                </Label>
                <Input
                  value={detalleFormacion}
                  onChange={(e) => setDetalleFormacion(e.target.value)}
                  placeholder={
                    tieneFormacion === "si"
                      ? "Ej. Juan Pérez — Curso APPCC homologado"
                      : "Ej. Evaluando opciones de consultoría externa"
                  }
                />
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-[#FAFAF7] flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={handleCancelar} className="text-muted-foreground hover:text-foreground">
            Cancelar
          </Button>
          <Button
            onClick={handleSiguiente}
            className="bg-[#6BB68A] hover:bg-[#5aa377] !text-white"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}