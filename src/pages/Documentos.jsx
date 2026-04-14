import React from "react";
import { FileText } from "lucide-react";

export default function Documentos() {
  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-semibold">Documentos</h1>
      </div>
      <p className="text-sm text-muted-foreground">Próximamente.</p>
    </div>
  );
}