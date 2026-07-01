import React, { useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building2, ChevronDown, Check, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessSelector() {
  const { businesses, currentBusiness, setCurrentBusiness, deleteBusiness } = useBusiness();
  const [bizToDelete, setBizToDelete] = useState(null);
  const [bizToSwitch, setBizToSwitch] = useState(null);
  const navigate = useNavigate();

  if (!currentBusiness) return null;

  function handleConfirmDelete() {
    const id = bizToDelete.id;
    setBizToDelete(null);
    deleteBusiness(id); // optimista: la lista se actualiza al instante
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 font-semibold hover:bg-[#FAFAF7]/10 px-2 bg-[#FAFAF7]/10 rounded-xl border border-[#FAFAF7]/20 text-[#FAFAF7]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate text-sm font-semibold text-[#FAFAF7]">{currentBusiness.name}</span>
            </div>
            <ChevronDown className="w-4 h-4 shrink-0 text-[#FAFAF7]/50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {businesses.map((biz) => (
            <DropdownMenuItem
              key={biz.id}
              onClick={() => {
                if (biz.id !== currentBusiness.id) setBizToSwitch(biz);
              }}
              className="gap-2 group"
            >
              <Check
                className={`w-4 h-4 text-[#6BB68A] shrink-0 ${
                  biz.id === currentBusiness.id ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="truncate flex-1">{biz.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBizToDelete(biz);
                }}
                className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-opacity ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => navigate("/onboarding")}
            className="gap-2 text-[#0A3E47] font-medium"
          >
            <Plus className="w-4 h-4" />
            Crear negocio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmación cambio de negocio */}
      <AlertDialog open={!!bizToSwitch} onOpenChange={(o) => !o && setBizToSwitch(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar de negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar al negocio <strong>{bizToSwitch?.name}</strong>. Se cargará la información correspondiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setCurrentBusiness(bizToSwitch); setBizToSwitch(null); }}
              className="bg-[#0A3E47] text-white hover:bg-[#0A3E47]/90"
            >
              Cambiar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!bizToDelete} onOpenChange={(o) => !o && setBizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que desea eliminar el negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{bizToDelete?.name}</strong> y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}