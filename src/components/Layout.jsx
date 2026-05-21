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
          "fixed lg:static inset-y-0 left-0 z-30 w-60 h-full flex flex-col transition-transform duration-200",
          "bg-[#0A3E47] border-r border-[#0d4d5a]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
        
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 shrink-0 flex items-center justify-center border-b border-white/10">
          <img
            src="https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/84a4e48b7_HQJPEG01-01copia.jpg"
            alt="Qualvia"
            className="h-16 object-contain rounded-none" />
        </div>

        {/* Usuario interno */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <SelectorUsuarioInterno />
        </div>

        {/* Nav */}
        <nav className="px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ?
              "bg-[#FAFAF7]/15 text-[#FAFAF7] font-semibold" :
              "text-[#FAFAF7]/60 hover:bg-[#FAFAF7]/10 hover:text-[#FAFAF7]"
            )
            }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Negocio activo — fondo arena */}
        <div className="px-3 pb-4 shrink-0">
          <div className="bg-white/10 rounded-xl px-3 py-2.5">
            <p className="text-[10px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Negocio activo</p>
            <BusinessSelector />
          </div>
        </div>

        {/* Usuario + Cerrar sesión */}
        <div className="px-3 pb-5 pt-3 shrink-0 border-t border-white/10">
          <div className="flex items-center gap-2 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-[#6BB68A] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.full_name || user?.email || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || "—"}</p>
              <p className="text-xs text-white/50 truncate">{user?.email}</p>
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
        <header className="h-16 border-b bg-[#FAFAF7] flex items-center px-4 gap-3 lg:hidden shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-black/5"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="text-base font-semibold text-foreground">Qualvia</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>);

}