import React from "react";
import { Shield, FileText, HelpCircle, Mail, ExternalLink } from "lucide-react";

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="rounded-2xl bg-secondary px-5 py-4 flex items-center gap-3">
      <Icon className="w-5 h-5 text-[#0A3E47]" />
      <h3 className="font-bold text-lg text-[#0A3E47]">{title}</h3>
    </div>
  );
}

function LinkRow({ icon: Icon, title, description, href }) {
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center justify-between px-5 py-4 hover:bg-secondary/40 transition-colors cursor-pointer group"
      onClick={href ? undefined : (e) => e.preventDefault()}
    >
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
        <div>
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-[#6BB68A] shrink-0" />
    </a>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
      {children}
    </div>
  );
}

export default function TabSeguridad() {
  return (
    <div className="space-y-6 max-w-3xl">

      {/* Seguridad y Privacidad */}
      <div className="space-y-3">
        <SectionHeader icon={Shield} title="Seguridad y Privacidad" />
        <Card>
          <LinkRow icon={FileText} title="Política de Privacidad" description="Cómo protegemos tus datos" />
          <LinkRow icon={FileText} title="Términos y Condiciones" description="Condiciones de uso del servicio" />
          <LinkRow icon={FileText} title="Aviso Legal" description="Información legal corporativa" />
        </Card>
      </div>

      {/* Soporte y Ayuda */}
      <div className="space-y-3">
        <SectionHeader icon={HelpCircle} title="Soporte y Ayuda" />
        <Card>
          <LinkRow icon={HelpCircle} title="Preguntas Frecuentes" description="Respuestas a dudas comunes" />
          <LinkRow icon={Mail} title="Soporte Técnico" description="soporte.qualvia@gmail.com" />
        </Card>
      </div>

    </div>
  );
}