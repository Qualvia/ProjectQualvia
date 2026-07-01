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
import { Check, ChevronLeft, ChevronRight, ShieldCheck, MapPin, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGO_URL = "https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/5c8196497_ChatGPTImage24may202620_29_16.png";

const STEPS = [
  { id: 1, label: "Sobre ti y tu negocio", icon: User },
  { id: 2, label: "Dirección y contacto", icon: MapPin },
];

const TIPOS_NEGOCIO = [
  "Restaurante", "Bar / Cafetería", "Catering", "Panadería / Pastelería",
  "Carnicería", "Pescadería", "Supermercado", "Colmado / Tienda",
  "Obrador", "Industria alimentaria", "Otro",
];

const CP_TO_PROVINCIA = {
  "01": "Álava", "02": "Albacete", "03": "Alicante", "04": "Almería", "05": "Ávila",
  "06": "Badajoz", "07": "Baleares", "08": "Barcelona", "09": "Burgos", "10": "Cáceres",
  "11": "Cádiz", "12": "Castellón", "13": "Ciudad Real", "14": "Córdoba", "15": "A Coruña",
  "16": "Cuenca", "17": "Girona", "18": "Granada", "19": "Guadalajara", "20": "Gipuzkoa",
  "21": "Huelva", "22": "Huesca", "23": "Jaén", "24": "León", "25": "Lleida",
  "26": "La Rioja", "27": "Lugo", "28": "Madrid", "29": "Málaga", "30": "Murcia",
  "31": "Navarra", "32": "Ourense", "33": "Asturias", "34": "Palencia", "35": "Las Palmas",
  "36": "Pontevedra", "37": "Salamanca", "38": "Santa Cruz de Tenerife", "39": "Cantabria",
  "40": "Segovia", "41": "Sevilla", "42": "Soria", "43": "Tarragona", "44": "Teruel",
  "45": "Toledo", "46": "Valencia", "47": "Valladolid", "48": "Vizcaya", "49": "Zamora",
  "50": "Zaragoza", "51": "Ceuta", "52": "Melilla",
};

function cpToProvincia(cp) {
  const prefix = cp.slice(0, 2);
  return CP_TO_PROVINCIA[prefix] || "";
}

const PROVINCIAS = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz",
  "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria",
  "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada",
  "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "A Coruña",
  "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga",
  "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca",
  "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora",
  "Zaragoza", "Ceuta", "Melilla",
];

const EMPTY = {
  persona_contacto: "", name: "", tipo_negocio: "", cif_nif: "",
  direccion: "", codigo_postal: "", ciudad: "", provincia: "", telefono: "",
};

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const { user, setCurrentBusiness, reloadBusinesses } = useBusiness();
  const navigate = useNavigate();

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  function canNext() {
    if (step === 1) {
      return form.persona_contacto.trim() && form.name.trim() && form.tipo_negocio && form.cif_nif.trim();
    }
    return true;
  }

  async function handleFinish() {
    if (!user) return;
    setSaving(true);

    const business = await base44.entities.Business.create({
      name: form.name,
      user_id: user.id,
      onboarding_completed: true,
    });

    await base44.entities.BusinessProfile.create({
      business_id: business.id,
      user_id: user.id,
      persona_contacto: form.persona_contacto,
      tipo_negocio: form.tipo_negocio,
      cif_nif: form.cif_nif,
      direccion: form.direccion,
      codigo_postal: form.codigo_postal,
      ciudad: form.ciudad,
      provincia: form.provincia,
      telefono: form.telefono,
      email_contacto: user.email || "",
    });

    // Marcar el nuevo negocio como activo antes de recargar para que el dashboard lo abra
    localStorage.setItem("qualvia_active_business_id", business.id);
    setSaving(false);
    await new Promise((r) => setTimeout(r, 600));
    await reloadBusinesses(user);
    navigate("/");
  }

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_8px_40px_-12px_rgba(10,62,71,0.15)] overflow-hidden flex flex-col md:flex-row" style={{ minHeight: 560 }}>

        {/* Sidebar */}
        <aside className="w-full md:w-72 shrink-0 bg-[#0A3E47] flex flex-col p-7 relative overflow-hidden">
          {/* Decorative accent */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#6BB68A]/8 blur-2xl" />
          <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-[#6BB68A]/5 blur-2xl" />

          {/* Logo */}
          <div className="relative mb-10 flex justify-center">
            <img src={LOGO_URL} alt="Qualvia" className="w-full max-w-[240px] h-auto object-contain" />
          </div>

          {/* Step nav */}
          <nav className="relative flex-1 space-y-5">
            {STEPS.map((s) => {
              const StepIcon = s.icon;
              const done = s.id < step;
              const active = s.id === step;
              return (
                <div key={s.id} className="flex items-center gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    done ? "bg-[#6BB68A] text-white" :
                    active ? "bg-[#6BB68A] text-white ring-4 ring-[#6BB68A]/20" :
                    "bg-white/8 text-white/35 border border-white/10"
                  )}>
                    {done ? <Check className="w-4.5 h-4.5" /> : <StepIcon className="w-4.5 h-4.5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-[10px] font-semibold uppercase tracking-wider transition-colors",
                      active ? "text-[#6BB68A]" : "text-white/30"
                    )}>Paso {s.id}</span>
                    <span className={cn(
                      "text-sm font-medium transition-colors leading-tight",
                      active ? "text-white" : done ? "text-white/65" : "text-white/35"
                    )}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Footer branding */}
          <div className="relative mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 text-white/40">
              <ShieldCheck className="w-4 h-4 text-[#6BB68A]/60" />
              <span className="text-xs font-medium">APPCC · Seguridad alimentaria</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 flex flex-col p-7 md:p-10">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Configuración inicial</span>
              <span className="text-xs font-bold text-[#0A3E47]">{step} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A3E47] to-[#6BB68A] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex-1">
            {step === 1 && <Step1 form={form} set={set} />}
            {step === 2 && <Step2 form={form} set={set} />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
              className="gap-1.5 rounded-xl h-11 px-5"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>

            {step < STEPS.length ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className={cn(
                  "gap-1.5 rounded-xl h-11 px-6 font-semibold transition-all",
                  canNext() ? "bg-[#0A3E47] hover:bg-[#0a3340] text-white shadow-md shadow-[#0A3E47]/20" : "bg-muted text-muted-foreground"
                )}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={saving}
                className="bg-[#6BB68A] hover:bg-[#5aa377] text-white gap-2 rounded-xl h-11 px-6 font-semibold shadow-md shadow-[#6BB68A]/20 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>Finalizar <Check className="w-4 h-4" /></>
                )}
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
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-[#1B1B1B]">{label}</Label>
      {children}
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3.5 mb-7">
      <div className="w-11 h-11 rounded-xl bg-[#0A3E47]/8 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#0A3E47]" />
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1B1B1B] leading-tight">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function Step1({ form, set }) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={User}
        title="Empecemos por lo básico"
        subtitle="Cuéntanos sobre ti y tu negocio para personalizar tu experiencia."
      />
      <Field label="Nombre completo *">
        <Input
          placeholder="Nombre del titular o responsable"
          value={form.persona_contacto}
          onChange={(e) => set("persona_contacto", e.target.value)}
          className="h-11 rounded-xl"
        />
      </Field>
      <Field label="Nombre comercial *">
        <Input
          placeholder="Ej: Restaurante El Sabor"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className="h-11 rounded-xl"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tipo de Negocio *">
          <Select value={form.tipo_negocio} onValueChange={(v) => set("tipo_negocio", v)}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {TIPOS_NEGOCIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="CIF/NIF *">
          <Input
            placeholder="B12345678 / 12345678A"
            value={form.cif_nif}
            onChange={(e) => set("cif_nif", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    </div>
  );
}

function Step2({ form, set }) {
  return (
    <div className="space-y-5">
      <StepHeader
        icon={MapPin}
        title="¿Dónde os encontráis?"
        subtitle="La ubicación es importante para la normativa local."
      />
      <Field label="Dirección fiscal *">
        <Input
          placeholder="Calle Principal, 123"
          value={form.direccion}
          onChange={(e) => set("direccion", e.target.value)}
          className="h-11 rounded-xl"
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Código Postal *">
          <Input
            placeholder="28001"
            inputMode="numeric"
            value={form.codigo_postal}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              set("codigo_postal", val);
              if (val.length >= 2) {
                const prov = cpToProvincia(val);
                if (prov) set("provincia", prov);
              }
            }}
            className="h-11 rounded-xl"
          />
        </Field>
        <Field label="Ciudad *">
          <Input
            placeholder="Madrid"
            value={form.ciudad}
            onChange={(e) => set("ciudad", e.target.value)}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Provincia *">
          <Select value={form.provincia} onValueChange={(v) => set("provincia", v)}>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>
              {PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Teléfono *">
          <Input
            placeholder="600 000 000"
            inputMode="numeric"
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value.replace(/\D/g, ""))}
            className="h-11 rounded-xl"
          />
        </Field>
      </div>
    </div>
  );
}