import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Building2, MapPin, Clock, User, Loader2, Save, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

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

function Field({ label, children, required }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = "text-[#0A3E47]" }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-5 h-5 ${color}`} />
      <h3 className={`font-bold text-lg ${color}`}>{title}</h3>
    </div>
  );
}

const EMPTY_PROFILE = {
  razon_social: "", tipo_negocio: "", actividad_principal: "", productos_principales: "",
  cif_nif: "", rgseaa: "", direccion: "", codigo_postal: "", ciudad: "",
  comunidad_autonoma: "", superficie: "", capacidad_clientes: "", num_empleados: "",
  horario_inicio: "", horario_fin: "", dias_apertura: [],
  persona_contacto: "", telefono: "", email_contacto: "",
};

export default function TabNegocio() {
  const { currentBusiness, user, setCurrentBusiness } = useBusiness();
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    setSaved(false);
    base44.entities.BusinessProfile.filter({ business_id: currentBusiness.id })
      .then((data) => {
        const p = data[0] || null;
        setProfile(p);
        setProfileId(p?.id || null);
        setForm({
          razon_social: p?.razon_social || "",
          tipo_negocio: p?.tipo_negocio || "",
          actividad_principal: p?.actividad_principal || "",
          productos_principales: p?.productos_principales || "",
          cif_nif: p?.cif_nif || "",
          rgseaa: p?.rgseaa || "",
          direccion: p?.direccion || "",
          codigo_postal: p?.codigo_postal || "",
          ciudad: p?.ciudad || "",
          comunidad_autonoma: p?.comunidad_autonoma || "",
          superficie: p?.superficie != null ? String(p.superficie) : "",
          capacidad_clientes: p?.capacidad_clientes != null ? String(p.capacidad_clientes) : "",
          num_empleados: p?.num_empleados != null ? String(p.num_empleados) : "",
          horario_inicio: p?.horario_inicio || "",
          horario_fin: p?.horario_fin || "",
          dias_apertura: p?.dias_apertura || [],
          persona_contacto: p?.persona_contacto || "",
          telefono: p?.telefono || "",
          email_contacto: p?.email_contacto || "",
        });
        setLoading(false);
      });
  }, [currentBusiness]);

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

  async function handleSave() {
    if (!currentBusiness || !user) return;
    setSaving(true);

    const payload = {
      business_id: currentBusiness.id,
      user_id: user.id,
      razon_social: form.razon_social,
      tipo_negocio: form.tipo_negocio,
      actividad_principal: form.actividad_principal,
      productos_principales: form.productos_principales,
      cif_nif: form.cif_nif,
      rgseaa: form.rgseaa,
      direccion: form.direccion,
      codigo_postal: form.codigo_postal,
      ciudad: form.ciudad,
      comunidad_autonoma: form.comunidad_autonoma,
      superficie: form.superficie ? Number(form.superficie) : undefined,
      capacidad_clientes: form.capacidad_clientes ? Number(form.capacidad_clientes) : undefined,
      num_empleados: form.num_empleados ? Number(form.num_empleados) : undefined,
      horario_inicio: form.horario_inicio,
      horario_fin: form.horario_fin,
      dias_apertura: form.dias_apertura,
      persona_contacto: form.persona_contacto,
      telefono: form.telefono,
      email_contacto: form.email_contacto,
    };

    if (profileId) {
      await base44.entities.BusinessProfile.update(profileId, payload);
    } else {
      const created = await base44.entities.BusinessProfile.create(payload);
      setProfileId(created.id);
    }

    // Actualizar nombre del negocio en Business si cambió
    if (currentBusiness.name !== form.razon_social && form.razon_social?.trim()) {
      // No sobreescribir el name del Business (es el nombre comercial)
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!currentBusiness) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
        No hay ningún negocio activo.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Banner */}
      <div className="rounded-2xl bg-secondary p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#0A3E47]/10 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-[#0A3E47]" />
        </div>
        <div>
          <p className="font-bold text-[#0A3E47] text-lg">Información del Negocio</p>
          <p className="text-sm text-muted-foreground">
            Negocio activo: <span className="font-semibold text-foreground">{currentBusiness.name}</span>
          </p>
        </div>
      </div>

      {/* Datos Generales */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader icon={Building2} title="Datos Generales" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial" required>
            <Input
              placeholder="Ej: Restaurante El Sabor"
              value={currentBusiness.name}
              disabled
              className="bg-secondary/50"
            />
          </Field>
          <Field label="Razón Social">
            <Input placeholder="Ej: Gastronomía S.L." value={form.razon_social} onChange={(e) => set("razon_social", e.target.value)} />
          </Field>
          <Field label="CIF / NIF">
            <Input placeholder="B12345678" value={form.cif_nif} onChange={(e) => set("cif_nif", e.target.value)} />
          </Field>
          <Field label="Registro Sanitario (RGSEAA)">
            <Input placeholder="Ej: 26.00000/M" value={form.rgseaa} onChange={(e) => set("rgseaa", e.target.value)} />
          </Field>
          <Field label="Tipo de negocio">
            <Select value={form.tipo_negocio} onValueChange={(v) => set("tipo_negocio", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {TIPOS_NEGOCIO.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Actividad principal">
            <Input placeholder="Ej: Comidas preparadas" value={form.actividad_principal} onChange={(e) => set("actividad_principal", e.target.value)} />
          </Field>
        </div>
        <Field label="Productos principales">
          <Input placeholder="Ej: Menús del día, postres..." value={form.productos_principales} onChange={(e) => set("productos_principales", e.target.value)} />
        </Field>
      </div>

      {/* Ubicación y Dimensiones */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader icon={MapPin} title="Ubicación y Dimensiones" color="text-[#0A3E47]" />

        <Field label="Dirección">
          <Input placeholder="Calle Principal, 123" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ciudad">
            <Input placeholder="Madrid" value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} />
          </Field>
          <Field label="Código Postal">
            <Input placeholder="28001" value={form.codigo_postal} onChange={(e) => set("codigo_postal", e.target.value)} />
          </Field>
          <Field label="Comunidad Autónoma">
            <Select value={form.comunidad_autonoma} onValueChange={(v) => set("comunidad_autonoma", v)}>
              <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
              <SelectContent>
                {CCAA.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Superficie (m²)">
            <Input type="number" placeholder="Ej: 150" value={form.superficie} onChange={(e) => set("superficie", e.target.value)} />
          </Field>
          <Field label="Capacidad clientes">
            <Input type="number" placeholder="Ej: 50" value={form.capacidad_clientes} onChange={(e) => set("capacidad_clientes", e.target.value)} />
          </Field>
          <Field label="Número de empleados">
            <Input type="number" placeholder="Ej: 5" value={form.num_empleados} onChange={(e) => set("num_empleados", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader icon={Clock} title="Horarios y Apertura" color="text-[#0A3E47]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Horario Apertura">
            <Input type="time" placeholder="09:00" value={form.horario_inicio} onChange={(e) => set("horario_inicio", e.target.value)} />
          </Field>
          <Field label="Horario Cierre">
            <Input type="time" placeholder="22:00" value={form.horario_fin} onChange={(e) => set("horario_fin", e.target.value)} />
          </Field>
        </div>
        <Field label="Días Laborables">
          <div className="flex gap-2 flex-wrap mt-1">
            {DIAS.map((dia) => (
              <button
                key={dia}
                type="button"
                onClick={() => toggleDia(dia)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors",
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

      {/* Contacto */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader icon={User} title="Contacto" color="text-[#0A3E47]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Persona de contacto">
            <Input placeholder="Nombre del responsable" value={form.persona_contacto} onChange={(e) => set("persona_contacto", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input placeholder="600 000 000" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} />
          </Field>
        </div>
        <Field label="Email de contacto">
          <Input placeholder="hola@negocio.com" value={form.email_contacto} onChange={(e) => set("email_contacto", e.target.value)} />
        </Field>
      </div>

      {/* Guardar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors disabled:opacity-60"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4" /> ¡Cambios guardados!</>
        ) : (
          <><Save className="w-4 h-4" /> Guardar cambios del negocio</>
        )}
      </button>
    </div>
  );
}