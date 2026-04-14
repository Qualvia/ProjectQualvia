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
import { Building2, ChevronDown, Check, Plus } from "lucide-react";
import CreateBusinessDialog from "./CreateBusinessDialog";

export default function BusinessSelector() {
  const { businesses, currentBusiness, setCurrentBusiness } = useBusiness();
  const [showCreate, setShowCreate] = useState(false);

  if (!currentBusiness) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 font-medium">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="max-w-[160px] truncate">{currentBusiness.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {businesses.map((biz) => (
            <DropdownMenuItem
              key={biz.id}
              onClick={() => setCurrentBusiness(biz)}
              className="gap-2"
            >
              <Check
                className={`w-4 h-4 ${
                  biz.id === currentBusiness.id
                    ? "text-primary opacity-100"
                    : "opacity-0"
                }`}
              />
              <span className="truncate">{biz.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreate(true)} className="gap-2 text-primary">
            <Plus className="w-4 h-4" />
            Crear negocio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBusinessDialog open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}