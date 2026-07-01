import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserCog, Plus, Pencil, Trash2, Loader2, Save, User, Shield, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROL_LABELS = {
  operario: "OPERARIO",
  administrador: "ADMINISTRADOR",
};

const EMPTY_FORM = { nombre: "", cargo: "", rol: "operario", pin: "", activo: true };

function Field({ label, children, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-foreground flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

export default function TabUsuarios() {
  const { currentBusiness, user } = useBusiness();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Perfil personal
  const [perfil, setPerfil] = useState({ nombre: user?.full_name || "", cargo: "", telefono: "", pin_actual: "", nuevo_pin: "" });
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savedPerfil, setSavedPerfil] = useState(false);

  useEffect(() => {
    if (!currentBusiness) return;
    fetchUsuarios();
  }, [currentBusiness]);

  useEffect(() => {
    if (!user) return;
    // Cargar datos guardados del perfil desde UserPreferences
    base44.entities.UserPreferences.filter({ user_id: user.id }).then((data) => {
      const p = data[0];
      setPerfil({
        nombre: user.full_name || "",
        cargo: p?.cargo || "",
        telefono: p?.telefono || "",
        pin_actual: "",
        nuevo_pin: "",
      });
    });
  }, [user]);

  async function fetchUsuarios() {
    setLoading(true);
    const data = await base44.entities.UsuarioInterno.filter({ business_id: currentBusiness.id });
    setUsuarios(data);
    setLoading(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({ nombre: u.nombre, cargo: u.cargo || "", rol: u.rol || "operario", pin: u.pin || "", activo: u.activo ?? true });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = { ...form, business_id: currentBusiness.id, user_id: user.id };
    if (editingId) {
      await base44.entities.UsuarioInterno.update(editingId, payload);
    } else {
      await base44.entities.UsuarioInterno.create(payload);
    }
    setSaving(false);
    setShowModal(false);
    fetchUsuarios();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await base44.entities.UsuarioInterno.delete(deleteTarget);
    setDeleteTarget(null);
    fetchUsuarios();
  }

  async function handleSavePerfil() {
    if (!user) return;
    setSavingPerfil(true);
    // Guardar cargo y teléfono en UserPreferences
    const prefs = await base44.entities.UserPreferences.filter({ user_id: user.id });
    const prefData = { cargo: perfil.cargo, telefono: perfil.telefono };
    if (prefs[0]) {
      await base44.entities.UserPreferences.update(prefs[0].id, { ...prefs[0], ...prefData });
    } else {
      await base44.entities.UserPreferences.create({ user_id: user.id, ...prefData });
    }
    setSavingPerfil(false);
    setSavedPerfil(true);
    setTimeout(() => setSavedPerfil(false), 3000);
  }

  if (!currentBusiness) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">No hay ningún negocio activo.</div>;
  }

  return (
    <div className="space-y-8">

      {/* Banner negocio activo */}
      <div className="rounded-2xl bg-secondary p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#0A3E47]/10 flex items-center justify-center shrink-0">
          <UserCog className="w-5 h-5 text-[#0A3E47]" />
        </div>
        <div>
          <p className="font-bold text-[#0A3E47]">Usuarios del Negocio</p>
          <p className="text-sm text-muted-foreground">Negocio activo: <span className="font-semibold text-foreground">{currentBusiness.name}</span></p>
        </div>
      </div>

      {/* ── Usuarios Internos ── */}
      <div className="space-y-0">
        {/* Header */}
        <div className="rounded-t-2xl bg-secondary px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-[#0A3E47]" />
            <h3 className="font-bold text-lg text-[#0A3E47]">Usuarios Internos</h3>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-border overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Cargo</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Rol</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Estado</th>
                  <th className="text-right px-5 py-3 text-muted-foreground font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No hay usuarios internos. Crea el primero.</td></tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-foreground">{u.nombre}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{u.cargo || "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#6BB68A]/15 text-[#3a7a52]">
                        <UserCog className="w-3 h-3" />
                        {ROL_LABELS[u.rol] || u.rol?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold border",
                        u.activo ? "border-[#6BB68A] text-[#3a7a52]" : "border-muted-foreground/40 text-muted-foreground"
                      )}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-secondary text-blue-500 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(u.id)} className="p-1.5 rounded-lg hover:bg-secondary text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Mi Perfil Personal ── */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-secondary px-5 py-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0A3E47]" />
          <h3 className="font-bold text-lg text-[#0A3E47]">Mi Perfil Personal</h3>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <div className="rounded-xl bg-secondary/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-[#6BB68A]">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <Field label="Persona de contacto">
              <Input placeholder="Nombre del responsable" value={perfil.nombre} disabled className="bg-secondary/50" />
            </Field>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-[#0A3E47]" />
              <p className="font-semibold text-sm text-[#0A3E47]">Seguridad de acceso rápido</p>
            </div>
            <Field label="PIN actual" icon={Lock}>
              <Input type="password" maxLength={4} placeholder="••••" value={perfil.pin_actual} onChange={(e) => setPerfil(p => ({ ...p, pin_actual: e.target.value }))} />
            </Field>
            <Field label="Cambiar PIN" icon={Pencil}>
              <Input type="password" maxLength={4} placeholder="4 números" value={perfil.nuevo_pin} onChange={(e) => setPerfil(p => ({ ...p, nuevo_pin: e.target.value }))} />
            </Field>
          </div>

          <button
            onClick={handleSavePerfil}
            disabled={savingPerfil}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {savingPerfil ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> :
              savedPerfil ? "¡Perfil guardado!" : <><Save className="w-4 h-4" /> Guardar cambios de perfil</>}
          </button>
        </div>
      </div>

      {/* Modal crear/editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Field label="Nombre">
              <Input placeholder="Nombre del usuario" value={form.nombre} onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))} />
            </Field>
            <Field label="Cargo">
              <Input placeholder="Ej: Encargado, Cocinero..." value={form.cargo} onChange={(e) => setForm(f => ({ ...f, cargo: e.target.value }))} />
            </Field>
            <Field label="Rol">
              <Select value={form.rol} onValueChange={(v) => setForm(f => ({ ...f, rol: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="operario">Operario (Acceso limitado)</SelectItem>
                  <SelectItem value="administrador">Administrador (Acceso total)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="PIN de acceso" icon={Lock}>
              <Input type="password" maxLength={4} placeholder="4 números" value={form.pin} onChange={(e) => setForm(f => ({ ...f, pin: e.target.value }))} />
            </Field>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Usuario Activo</Label>
              <Switch checked={form.activo} onCheckedChange={(v) => setForm(f => ({ ...f, activo: v }))} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !form.nombre.trim()}
              className="w-full py-3 rounded-xl bg-[#6BB68A] hover:bg-[#5aa377] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear Usuario"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmación eliminar */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}