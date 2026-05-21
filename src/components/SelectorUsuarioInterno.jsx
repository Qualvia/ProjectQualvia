import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SelectorUsuarioInterno() {
  const { currentBusiness, user } = useBusiness();
  const { usuarioActivo, setUsuarioActivo } = useUsuarioInterno();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("lista"); // "lista" | "pin"
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  // Al cambiar de negocio, resetear al usuario principal
  useEffect(() => {
    setUsuarioActivo(null);
  }, [currentBusiness?.id]);

  useEffect(() => {
    if (!currentBusiness) return;
    base44.entities.UsuarioInterno.filter({ business_id: currentBusiness.id })
      .then((data) => setUsuarios(data.filter((u) => u.activo)));
  }, [currentBusiness, open]);

  function handleOpen() {
    setStep("lista");
    setSeleccionado(null);
    setPin("");
    setError("");
    setOpen(true);
  }

  function handleSelectUsuario(u) {
    setSeleccionado(u);
    setPin("");
    setError("");
    setStep("pin");
  }

  function handleSelectPropietario() {
    setUsuarioActivo(null);
    setOpen(false);
  }

  function handleAcceder() {
    if (!seleccionado) return;
    if (seleccionado.pin && pin !== seleccionado.pin) {
      setError("PIN incorrecto");
      return;
    }
    setUsuarioActivo(seleccionado);
    setOpen(false);
  }

  const displayName = usuarioActivo
    ? usuarioActivo.nombre
    : (user?.full_name || user?.email || "—");

  const inicial = displayName?.[0]?.toUpperCase() || "?";

  return (
    <>
      {/* Botón en sidebar */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed border-[#FAFAF7]/30 hover:bg-[#FAFAF7]/10 transition-colors text-left"
      >
        <div className="w-5 h-5 rounded-full bg-[#FAFAF7]/20 flex items-center justify-center text-[#FAFAF7] font-bold text-[10px] shrink-0">
          {inicial}
        </div>
        <p className="text-[11px] font-medium text-[#FAFAF7] truncate flex-1">{displayName}</p>
        <span className="text-[#FAFAF7]/50 text-xs shrink-0">›</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          {step === "lista" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">¿Quién eres?</h2>
                <p className="text-sm text-muted-foreground mt-1">Selecciona tu usuario para acceder</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {usuarios.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUsuario(u)}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-border hover:border-[#6BB68A] hover:bg-[#6BB68A]/5 transition-all"
                  >
                    <p className="font-semibold text-foreground">{u.nombre}</p>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-lg">
                      {u.nombre[0].toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{u.rol === "administrador" ? "Administrador" : "Operario"}</p>
                  </button>
                ))}
                {/* Tarjeta propietario */}
                <button
                  onClick={handleSelectPropietario}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl border border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-100/60 transition-all"
                >
                  <p className="font-semibold text-blue-600 truncate max-w-full">{user?.full_name || user?.email}</p>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === "pin" && seleccionado && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Hola, {seleccionado.nombre}</h2>
                <p className="text-sm text-muted-foreground mt-1">Introduce tu PIN para continuar</p>
              </div>
              <div className="flex justify-center">
                <input
                  type="password"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(""); }}
                  className="w-48 text-center text-2xl tracking-widest border-2 border-border rounded-xl px-4 py-3 focus:outline-none focus:border-[#6BB68A]"
                  autoFocus
                />
              </div>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStep("lista")}
                  className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleAcceder}
                  disabled={!pin}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors",
                    pin ? "bg-[#6BB68A] hover:bg-[#5aa377]" : "bg-[#6BB68A]/40 cursor-not-allowed"
                  )}
                >
                  Acceder
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}