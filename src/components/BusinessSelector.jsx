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
          <Button
            variant="ghost"
            className="w-full justify-between gap-2 font-medium text-white/90 hover:bg-white/10 hover:text-white px-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="w-4 h-4 shrink-0 text-[#6BB68A]" />
              <span className="truncate text-sm">{currentBusiness.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-white/50" />
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
                className={`w-4 h-4 text-[#6BB68A] ${
                  biz.id === currentBusiness.id ? "opacity-100" : "opacity-0"
                }`}
              />
              <span className="truncate">{biz.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCreate(true)}
            className="gap-2 text-[#0A3E47] font-medium"
          >
            <Plus className="w-4 h-4" />
            Crear negocio
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBusinessDialog open={showCreate} onOpenChange={setShowCreate} />
    </>
  );
}