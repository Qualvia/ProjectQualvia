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
          "bg-[#FAFAF7] border-r border-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
        
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 shrink-0 flex items-center justify-center border-b border-white/10">
          <img
            src="https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/84a4e48b7_HQJPEG01-01copia.jpg"
            alt="Qualvia"
            className="h-10 object-contain" />
        </div>

        {/* Usuario interno */}
        <div className="px-3 pt-4 pb-2 shrink-0">
          <SelectorUsuarioInterno />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
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
                ? "bg-[#0A3E47] text-white font-semibold"
                : "text-foreground/80 hover:bg-[#0A3E47]/8 hover:text-foreground"
            )
            }>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          )}
        </nav>

        {/* Negocio activo — fondo arena */}
        <div className="px-3 pb-5 pt-4 shrink-0">
          <div className="bg-[#EDE6DA] rounded-2xl px-4 py-3">
            <p className="text-xs font-semibold text-[#0A3E47]/60 mb-2">Negocio activo</p>
            <BusinessSelector />
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