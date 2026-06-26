import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Datos Básicos" },
  { id: 2, label: "Ubicación" },
  { id: 3, label: "Dimensiones" },
  { id: 4, label: "Contacto" },
  { id: 5, label: "Presencia Digital" },
];

const TIPOS_NEGOCIO = [
  "Restaurante", "Bar / Cafetería", "Catering", "Panadería / Pastelería",
  "Carnicería", "Pescadería", "Supermercado", "Colmado / Tienda",
  "Obrador", "Industria alimentaria", "Otro",
];

const CCAA = [
  "Andalucía", "Aragón", "Asturias", "Baleares", "Canarias", "Cantabria",
  "Castilla-La Mancha", "Castilla y León", "Cataluña", "Extremadura",
  "Galicia", "La Rioja", "Madrid", "Murcia", "Navarra", "País Vasco",
  "Valencia", "Ceuta", "Melilla",
];

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const EMPTY = {
  name: "", razon_social: "", tipo_negocio: "", actividad_principal: "", productos_principales: "",
  direccion: "", codigo_postal: "", ciudad: "", comunidad_autonoma: "",
  num_empleados: "", superficie: "", capacidad_clientes: "", cif_nif: "", rgseaa: "",
  telefono: "", email_contacto: "", horario_inicio: "", horario_fin: "", dias_apertura: [],
  web: "", instagram: "", facebook: "",
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { user, setCurrentBusiness, setBusinesses, reloadBusinesses } = useBusiness();
  const navigate = useNavigate();

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function toggleDia(dia) {
    setForm((prev) => ({
      ...prev,
      dias_apertura: prev.dias_apertura.includes(dia)
        ? prev.dias_apertura.filter((d) => d !== dia)
        : [...prev.dias_apertura, dia],
    }));
  }

  function canNext() {
    if (step === 1) return form.name.trim() && form.tipo_negocio && form.actividad_principal.trim();
    if (step === 2) return form.direccion.trim() && form.ciudad.trim() && form.comunidad_autonoma;
    if (step === 3) return form.num_empleados !== "";
    if (step === 4) return form.telefono.trim() && form.email_contacto.trim();
    return true;
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);

    // 1. Crear Business con solo los campos mínimos
    const business = await base44.entities.Business.create({
      name: form.name,
      user_id: user.id,
      onboarding_completed: true,
    });

    // 2. Crear BusinessProfile con todos los datos del onboarding
    await base44.entities.BusinessProfile.create({
      business_id: business.id,
      user_id: user.id,
      razon_social: form.razon_social,
      tipo_negocio: form.tipo_negocio,
      actividad_principal: form.actividad_principal,
      productos_principales: form.productos_principales,
      direccion: form.direccion,
      codigo_postal: form.codigo_postal,
      ciudad: form.ciudad,
      comunidad_autonoma: form.comunidad_autonoma,
      num_empleados: form.num_empleados ? Number(form.num_empleados) : undefined,
      superficie: form.superficie ? Number(form.superficie) : undefined,
      capacidad_clientes: form.capacidad_clientes ? Number(form.capacidad_clientes) : undefined,
      cif_nif: form.cif_nif,
      rgseaa: form.rgseaa,
      telefono: form.telefono,
      email_contacto: form.email_contacto,
      horario_inicio: form.horario_inicio,
      horario_fin: form.horario_fin,
      dias_apertura: form.dias_apertura,
      web: form.web,
      instagram: form.instagram,
      facebook: form.facebook,
    });

    setSaving(false);
    await new Promise((r) => setTimeout(r, 800));
    await reloadBusinesses(user);
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden flex" style={{ minHeight: 520 }}>

        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-[#0A3E47] flex flex-col p-6">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-[#6BB68A]" />
            <span className="text-white font-bold text-lg tracking-wide">QUALVIA</span>
          </div>

          <nav className="flex-1 space-y-2">
            {STEPS.map((s) => {
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                    done ? "bg-[#6BB68A] text-white" :
                    active ? "bg-[#6BB68A] text-white ring-2 ring-[#6BB68A]/40" :
                    "bg-white/10 text-white/40"
                  )}>
                    {done ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-white" : done ? "text-white/70" : "text-white/40"
                  )}>{s.label}</span>
                </div>
              );
            })}
          </nav>

          <p className="text-white/40 text-xs mt-6">Paso {step} de {STEPS.length}</p>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col p-8">
          <div className="flex-1">
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
            {step === 3 && <Step3 form={form} set={set} />}
            {step === 4 && <Step4 form={form} set={set} toggleDia={toggleDia} />}
            {step === 5 && <Step5 form={form} set={set} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>

            {step < 5 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className={cn("gap-1", canNext() ? "bg-[#0A3E47] hover:bg-[#0a3340] text-white" : "bg-muted text-muted-foreground")}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2"
              >
                {saving ? "Guardando..." : "Finalizar"} <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Steps ── */

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-[#1B1B1B]">{label}</Label>
      {children}
    </div>
  );
}

function Step1({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B]">Empecemos por lo básico</h2>
        <p className="text-sm text-muted-foreground mt-1">Cuéntanos sobre tu negocio para personalizar tu experiencia.</p>
      </div>
      <Field label="Nombre Comercial *">
        <Input placeholder="Ej: Restaurante El Sabor" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Razón Social">
        <Input placeholder="Ej: Gastronomía S.L." value={form.razon_social} onChange={(e) => set("razon_social", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo de Negocio *">
          <Select value={form.tipo_negocio} onValueChange={(v) => set("tipo_negocio", v)}>
            <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {TIPOS_NEGOCIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Actividad Principal *">
          <Input placeholder="Ej: Comidas preparadas" value={form.actividad_principal} onChange={(e) => set("actividad_principal", e.target.value)} />
        </Field>
      </div>
      <Field label="Productos Principales">
        <Input placeholder="Ej: Menús del día, postres caseros..." value={form.productos_principales} onChange={(e) => set("productos_principales", e.target.value)} />
      </Field>
    </div>
  );
}

function Step2({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B]">¿Dónde os encontráis?</h2>
        <p className="text-sm text-muted-foreground mt-1">La ubicación es importante para la normativa local.</p>
      </div>
      <Field label="Dirección *">
        <Input placeholder="Calle Principal, 123" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Código Postal">
          <Input placeholder="28001" value={form.codigo_postal} onChange={(e) => set("codigo_postal", e.target.value)} />
        </Field>
        <Field label="Ciudad *">
          <Input placeholder="Madrid" value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
        </Field>
      </div>
      <Field label="Comunidad Autónoma *">
        <Select value={form.comunidad_autonoma} onValueChange={(v) => set("comunidad_autonoma", v)}>
          <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
          <SelectContent>
            {CCAA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
    </div>
  );
}

function Step3({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B]">Dimensiones del negocio</h2>
        <p className="text-sm text-muted-foreground mt-1">Para adaptar los planes de higiene y APPCC.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nº Empleados *">
          <Input type="number" placeholder="Ej: 5" value={form.num_empleados} onChange={(e) => set("num_empleados", e.target.value)} />
        </Field>
        <Field label="Superficie (m²)">
          <Input type="number" placeholder="Ej: 150" value={form.superficie} onChange={(e) => set("superficie", e.target.value)} />
        </Field>
      </div>
      <Field label="Capacidad Clientes">
        <Input type="number" placeholder="Ej: 50" value={form.capacidad_clientes} onChange={(e) => set("capacidad_clientes", e.target.value)} />
      </Field>
      <Field label="CIF/NIF">
        <Input placeholder="B12345678" value={form.cif_nif} onChange={(e) => set("cif_nif", e.target.value)} />
      </Field>
      <Field label="RGSEAA (Registro Sanitario)">
        <Input placeholder="Ej: 26.00000/M" value={form.rgseaa} onChange={(e) => set("rgseaa", e.target.value)} />
      </Field>
    </div>
  );
}

function Step4({ form, set, toggleDia }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B]">Contacto y Horarios</h2>
        <p className="text-sm text-muted-foreground mt-1">Para notificaciones y gestión de agenda.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono *">
          <Input placeholder="600 000 000" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
        </Field>
        <Field label="Email Contacto *">
          <Input placeholder="hola@negocio.com" value={form.email_contacto} onChange={(e) => set("email_contacto", e.target.value)} />
        </Field>
      </div>
      <Field label="Horario">
        <div className="flex items-center gap-3">
          <Input placeholder="09:00" value={form.horario_inicio} onChange={(e) => set("horario_inicio", e.target.value)} className="w-28" />
          <span className="text-sm text-muted-foreground">a</span>
          <Input placeholder="22:00" value={form.horario_fin} onChange={(e) => set("horario_fin", e.target.value)} className="w-28" />
        </div>
      </Field>
      <Field label="Días de apertura">
        <div className="flex gap-2 flex-wrap">
          {DIAS.map((dia) => (
            <button
              key={dia}
              type="button"
              onClick={() => toggleDia(dia)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                form.dias_apertura.includes(dia)
                  ? "bg-[#0A3E47] text-white border-[#0A3E47]"
                  : "bg-white text-foreground border-border hover:border-[#0A3E47]"
              )}
            >
              {dia}
            </button>
          ))}
        </div>
      </Field>
    </div>
  );
}

function Step5({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[#1B1B1B]">Presencia Digital</h2>
        <p className="text-sm text-muted-foreground mt-1">Opcional. Para integrar tus redes en el futuro.</p>
      </div>
      <Field label="Sitio Web">
        <Input placeholder="www.minegocio.com" value={form.web} onChange={(e) => set("web", e.target.value)} />
      </Field>
      <Field label="Instagram">
        <Input placeholder="@usuario" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
      </Field>
      <Field label="Facebook">
        <Input placeholder="/pagina" value={form.facebook} onChange={(e) => set("facebook", e.target.value)} />
      </Field>
    </div>
  );
}