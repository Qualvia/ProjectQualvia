import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Printer, Activity, Loader2, Save, CheckCircle2 } from "lucide-react";

const MODELOS_IMPRESORA = [
  "Zebra ZD410", "Zebra ZD620", "Brother QL-820NWB", "Brother TD-4550DNWB",
  "DYMO LabelWriter 550", "Epson TM-L90", "Otro",
];

const ANCHOS_PAPEL = ["38mm", "56mm", "62mm", "80mm", "100mm", "112mm"];

const PROVEEDORES_SENSORES = [
  "Testo Saveris", "Cooldis", "Sensaphone", "Monnit", "ThermoWorks",
  "Dragino", "Otro",
];

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, right }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-[#0A3E47]" />
        <h3 className="font-bold text-lg text-[#0A3E47]">{title}</h3>
      </div>
      {right}
    </div>
  );
}

const EMPTY = {
  impresora_nombre: "", impresora_modelo: "", impresora_ip: "",
  impresora_ubicacion: "", impresora_mac: "", impresora_ancho_papel: "",
  sensores_activo: false, sensores_proveedor: "", sensores_api_key: "",
  sensores_frecuencia: 15, sensores_gateway_id: "",
};

export default function TabEquipos() {
  const { currentBusiness, user } = useBusiness();
  const [form, setForm] = useState(EMPTY);
  const [configId, setConfigId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    setLoading(true);
    setSaved(false);
    base44.entities.ConfigEquipos.filter({ business_id: currentBusiness.id })
      .then((data) => {
        const c = data[0] || null;
        setConfigId(c?.id || null);
        if (c) {
          setForm({
            impresora_nombre: c.impresora_nombre || "",
            impresora_modelo: c.impresora_modelo || "",
            impresora_ip: c.impresora_ip || "",
            impresora_ubicacion: c.impresora_ubicacion || "",
            impresora_mac: c.impresora_mac || "",
            impresora_ancho_papel: c.impresora_ancho_papel || "",
            sensores_activo: c.sensores_activo || false,
            sensores_proveedor: c.sensores_proveedor || "",
            sensores_api_key: c.sensores_api_key || "",
            sensores_frecuencia: c.sensores_frecuencia ?? 15,
            sensores_gateway_id: c.sensores_gateway_id || "",
          });
        } else {
          setForm(EMPTY);
        }
        setLoading(false);
      });
  }, [currentBusiness]);

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave() {
    if (!currentBusiness || !user) return;
    setSaving(true);
    const payload = { ...form, business_id: currentBusiness.id, user_id: user.id };
    if (configId) {
      await base44.entities.ConfigEquipos.update(configId, payload);
    } else {
      const created = await base44.entities.ConfigEquipos.create(payload);
      setConfigId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!currentBusiness) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">No hay ningún negocio activo.</div>;
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header banner */}
      <div className="rounded-2xl bg-secondary p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#0A3E47]/10 flex items-center justify-center shrink-0">
          <Printer className="w-6 h-6 text-[#0A3E47]" />
        </div>
        <div>
          <p className="font-bold text-[#0A3E47] text-lg">Gestión de Equipos</p>
          <p className="text-sm text-muted-foreground">Configura impresora de etiquetas y sensores para <span className="font-semibold text-foreground">{currentBusiness.name}</span></p>
        </div>
      </div>

      {/* Impresora */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader icon={Printer} title="Impresora de Etiquetas" />

        <Field label="Nombre identificativo">
          <Input placeholder="Ej: Impresora Cocina" value={form.impresora_nombre} onChange={(e) => set("impresora_nombre", e.target.value)} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo / Modelo">
            <Select value={form.impresora_modelo} onValueChange={(v) => set("impresora_modelo", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {MODELOS_IMPRESORA.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Dirección IP">
            <Input placeholder="192.168.1.XXX" value={form.impresora_ip} onChange={(e) => set("impresora_ip", e.target.value)} />
          </Field>
          <Field label="Ubicación física">
            <Input placeholder="Ej: Zona expedición" value={form.impresora_ubicacion} onChange={(e) => set("impresora_ubicacion", e.target.value)} />
          </Field>
          <Field label="Dirección MAC (Opcional)">
            <Input placeholder="00:00:00:00:00:00" value={form.impresora_mac} onChange={(e) => set("impresora_mac", e.target.value)} />
          </Field>
          <Field label="Ancho de papel">
            <Select value={form.impresora_ancho_papel} onValueChange={(v) => set("impresora_ancho_papel", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {ANCHOS_PAPEL.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>

      {/* Sensores */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <SectionHeader
          icon={Activity}
          title="Configuración de Sensores"
          right={
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Integración Activa</span>
              <Switch checked={form.sensores_activo} onCheckedChange={(v) => set("sensores_activo", v)} />
            </div>
          }
        />

        {form.sensores_activo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Proveedor / Sistema">
              <Select value={form.sensores_proveedor} onValueChange={(v) => set("sensores_proveedor", v)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {PROVEEDORES_SENSORES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="API Key / Token">
              <Input type="password" placeholder="••••••••••••••" value={form.sensores_api_key} onChange={(e) => set("sensores_api_key", e.target.value)} />
            </Field>
            <Field label="Frecuencia Lectura (min)">
              <Input type="number" placeholder="15" value={form.sensores_frecuencia} onChange={(e) => set("sensores_frecuencia", Number(e.target.value))} />
            </Field>
            <Field label="ID del Hub / Gateway">
              <Input placeholder="Ej: GW-2024-X99" value={form.sensores_gateway_id} onChange={(e) => set("sensores_gateway_id", e.target.value)} />
            </Field>
          </div>
        )}
      </div>

      {/* Guardar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0A3E47] hover:bg-[#0a3340] text-white font-semibold text-sm transition-colors disabled:opacity-60"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4" /> ¡Configuración guardada!</>
        ) : (
          <><Save className="w-4 h-4" /> Guardar Configuración Equipos</>
        )}
      </button>
    </div>
  );
}