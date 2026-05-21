import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Globe, Thermometer, Weight, Droplets, Bell, Loader2, Save, CheckCircle2, Settings2 } from "lucide-react";

const EMPTY = {
  idioma: "Español",
  unidad_temperatura: "celsius",
  unidad_peso: "kg",
  unidad_volumen: "litros",
  notificaciones: true,
};

function PreferenceRow({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#0A3E47] shrink-0" />
        <div>
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function TabPreferencias() {
  const { user } = useBusiness();
  const [form, setForm] = useState(EMPTY);
  const [prefId, setPrefId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setSaved(false);
    base44.entities.UserPreferences.filter({ user_id: user.id })
      .then((data) => {
        const p = data[0] || null;
        setPrefId(p?.id || null);
        if (p) {
          setForm({
            idioma: p.idioma || "Español",
            unidad_temperatura: p.unidad_temperatura || "celsius",
            unidad_peso: p.unidad_peso || "kg",
            unidad_volumen: p.unidad_volumen || "litros",
            notificaciones: p.notificaciones ?? true,
          });
        } else {
          setForm(EMPTY);
        }
        setLoading(false);
      });
  }, [user]);

  function set(field, val) {
    setForm((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const payload = { ...form, user_id: user.id };
    if (prefId) {
      await base44.entities.UserPreferences.update(prefId, payload);
    } else {
      const created = await base44.entities.UserPreferences.create(payload);
      setPrefId(created.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Banner */}
      <div className="rounded-2xl bg-secondary p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#0A3E47]/10 flex items-center justify-center shrink-0">
          <Settings2 className="w-6 h-6 text-[#0A3E47]" />
        </div>
        <div>
          <p className="font-bold text-[#0A3E47] text-lg">Preferencias de la Aplicación</p>
          <p className="text-sm text-muted-foreground">Personaliza el comportamiento y visualización de la app</p>
        </div>
      </div>

      {/* Filas */}
      <div className="space-y-3">
        <PreferenceRow icon={Globe} title="Idioma" description="Selecciona el idioma de la aplicación">
          <Select value={form.idioma} onValueChange={(v) => set("idioma", v)}>
            <SelectTrigger className="w-44 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Español">Español</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Français">Français</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceRow>

        <PreferenceRow icon={Thermometer} title="Unidad de temperatura" description="Celsius o Fahrenheit">
          <Select value={form.unidad_temperatura} onValueChange={(v) => set("unidad_temperatura", v)}>
            <SelectTrigger className="w-44 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celsius">ºC (Celsius)</SelectItem>
              <SelectItem value="fahrenheit">ºF (Fahrenheit)</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceRow>

        <PreferenceRow icon={Weight} title="Unidad de peso" description="Kilogramos o Libras">
          <Select value={form.unidad_peso} onValueChange={(v) => set("unidad_peso", v)}>
            <SelectTrigger className="w-44 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg (Kilogramos)</SelectItem>
              <SelectItem value="lb">lb (Libras)</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceRow>

        <PreferenceRow icon={Droplets} title="Unidad de volumen" description="Litros o Galones">
          <Select value={form.unidad_volumen} onValueChange={(v) => set("unidad_volumen", v)}>
            <SelectTrigger className="w-44 bg-secondary border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="litros">L (Litros)</SelectItem>
              <SelectItem value="galones">gal (Galones)</SelectItem>
            </SelectContent>
          </Select>
        </PreferenceRow>

        <PreferenceRow icon={Bell} title="Notificaciones generales" description="Recibir alertas y recordatorios">
          <Switch checked={form.notificaciones} onCheckedChange={(v) => set("notificaciones", v)} />
        </PreferenceRow>
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
          <><CheckCircle2 className="w-4 h-4" /> ¡Preferencias guardadas!</>
        ) : (
          <><Save className="w-4 h-4" /> Guardar Preferencias Personales</>
        )}
      </button>
    </div>
  );
}