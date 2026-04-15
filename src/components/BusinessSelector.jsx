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
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  if (!currentBusiness) return null;

  async function handleConfirmDelete() {
    setDeleting(true);
    await deleteBusiness(bizToDelete.id);
    setBizToDelete(null);
    setDeleting(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 font-semibold text-[#0A3E47] hover:bg-[#0A3E47]/10 px-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 shrink-0 text-[#6BB68A]" />
              <span className="truncate text-sm">{currentBusiness.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-[#0A3E47]/50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {businesses.map((biz) => (
            <DropdownMenuItem
              key={biz.id}
              onClick={() => setCurrentBusiness(biz)}
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

      <AlertDialog open={!!bizToDelete} onOpenChange={(o) => !o && setBizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que desea eliminar el negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará <strong>{bizToDelete?.name}</strong> y todos sus datos asociados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}