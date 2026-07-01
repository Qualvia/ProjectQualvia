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
  { id: 1, label: "Sobre ti y tu negocio" },
  { id: 2, label: "Dirección y contacto" },
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
  const { user, setCurrentBusiness, setBusinesses, reloadBusinesses } = useBusiness();
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

            {step < STEPS.length ? (
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
        <p className="text-sm text-muted-foreground mt-1">Cuéntanos sobre ti y tu negocio para personalizar tu experiencia.</p>
      </div>
      <Field label="Nombre completo *">
        <Input placeholder="Nombre del titular o responsable" value={form.persona_contacto} onChange={(e) => set("persona_contacto", e.target.value)} />
      </Field>
      <Field label="Nombre comercial *">
        <Input placeholder="Ej: Restaurante El Sabor" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>
      <Field label="Tipo de Negocio *">
        <Select value={form.tipo_negocio} onValueChange={(v) => set("tipo_negocio", v)}>
          <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
          <SelectContent>
            {TIPOS_NEGOCIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="CIF/NIF *">
        <Input placeholder="B12345678 / 12345678A" value={form.cif_nif} onChange={(e) => set("cif_nif", e.target.value)} />
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
      <Field label="Dirección fiscal *">
        <Input placeholder="Calle Principal, 123" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Código Postal *">
          <Input placeholder="28001" value={form.codigo_postal} onChange={(e) => {
            const val = e.target.value;
            set("codigo_postal", val);
            if (val.length >= 2) {
              const prov = cpToProvincia(val);
              if (prov) set("provincia", prov);
            }
          }} />
        </Field>
        <Field label="Ciudad *">
          <Input placeholder="Madrid" value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
        </Field>
      </div>
      <Field label="Provincia *">
        <Select value={form.provincia} onValueChange={(v) => set("provincia", v)}>
          <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
          <SelectContent>
            {PROVINCIAS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Teléfono *">
        <Input placeholder="600 000 000" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
      </Field>
    </div>
  );
}