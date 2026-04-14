import React, { useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function CreateBusinessDialog({ open, onOpenChange }) {
  const { createBusiness } = useBusiness();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await createBusiness(name.trim());
    setCreating(false);
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nuevo negocio</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="biz-name">Nombre del negocio</Label>
          <Input
            id="biz-name"
            placeholder="Ej: Mi Restaurante"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || creating}>
            {creating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}