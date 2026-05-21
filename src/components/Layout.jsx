import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { base44 } from "@/api/base44Client";
import BusinessSelector from "@/components/BusinessSelector";
import SelectorUsuarioInterno from "@/components/SelectorUsuarioInterno";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckSquare,
  Bot,
  Settings,
  Menu,
  X,
  LogOut } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
{ to: "/", label: "Dashboard", icon: LayoutDashboard },
{ to: "/registros", label: "Registros", icon: ClipboardList },
{ to: "/documentos", label: "Documentos", icon: FileText },
{ to: "/checklist", label: "Checklist", icon: CheckSquare },
{ to: "/asistente", label: "Asistente", icon: Bot },
{ to: "/ajustes", label: "Ajustes", icon: Settings }];


export default function Layout() {
  const { user, businesses, currentBusiness, isLoading } = useBusiness();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (businesses.length === 0 || !currentBusiness?.onboarding_completed) {
      navigate("/onboarding");
    }
  }, [isLoading, businesses, currentBusiness]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>);

  }

  if (!currentBusiness?.onboarding_completed) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen &&
      <div
        className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
        onClick={() => setSidebarOpen(false)} />

      }

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-200",
          "bg-[#0A3E47]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
        
        {/* Logo */}
        <div className="px-5 pt-7 pb-6 shrink-0">
          <img
            src="https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/84a4e48b7_HQJPEG01-01copia.jpg"
            alt="Qualvia"
            className="h-9 w-auto object-contain object-left" />
        </div>

        {/* Separador top */}
        <div className="mx-4 mb-5 border-t border-white/10" />

        {/* Nav — ocupa el espacio central */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-[#6BB68A] text-white shadow-sm"
                : "text-white/65 hover:bg-white/10 hover:text-white"
            )
            }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          )}
        </nav>

        {/* Bloque inferior */}
        <div className="px-3 pb-5 pt-3 shrink-0 space-y-3">

          {/* Separador */}
          <div className="border-t border-white/10 mb-1" />

          {/* Selector usuario interno */}
          <SelectorUsuarioInterno />

          {/* Negocio activo */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 px-1 mb-1.5">Negocio activo</p>
            <div className="bg-[#6BB68A]/15 border border-[#6BB68A]/25 rounded-xl px-1 py-1">
              <BusinessSelector />
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-white/10" />

          {/* User info */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#6BB68A] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate leading-tight">{user?.full_name || "—"}</p>
              <p className="text-[11px] text-[#6BB68A] truncate leading-tight">{user?.email}</p>
            </div>
            <button
              onClick={() => base44.auth.logout()}
              title="Cerrar sesión"
              className="shrink-0 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="h-16 border-b bg-[#0A3E47] flex items-center px-4 gap-3 lg:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="text-base font-semibold text-white">Qualvia</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>);

}