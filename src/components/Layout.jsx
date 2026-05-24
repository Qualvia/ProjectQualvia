import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { useUsuarioInterno } from "@/contexts/UsuarioInternoContext";
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

const ALL_NAV_ITEMS = [
{ to: "/", label: "Dashboard", icon: LayoutDashboard, soloAdmin: true },
{ to: "/registros", label: "Registros", icon: ClipboardList, soloAdmin: false },
{ to: "/documentos", label: "Documentos", icon: FileText, soloAdmin: true },
{ to: "/checklist", label: "Checklist", icon: CheckSquare, soloAdmin: false },
{ to: "/asistente", label: "Asistente", icon: Bot, soloAdmin: true },
{ to: "/ajustes", label: "Ajustes", icon: Settings, soloAdmin: true }];


export default function Layout() {
  const { user, businesses, currentBusiness, isLoading } = useBusiness();
  const { esOperario } = useUsuarioInterno();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const NAV_ITEMS = esOperario ?
  ALL_NAV_ITEMS.filter((item) => !item.soloAdmin) :
  ALL_NAV_ITEMS;

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
          "fixed lg:static inset-y-0 left-0 z-30 h-full flex flex-col transition-all duration-300 relative",
          "bg-[#0A3E47] border-r border-[#0d4d5a]",
          sidebarCollapsed ? "w-[60px]" : "w-52",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>

        {/* Toggle collapse button — desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 w-7 h-7 rounded-full bg-white border border-border shadow-md items-center justify-center text-[#0A3E47] hover:bg-secondary transition-colors"
          title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}>
          
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={cn("transition-transform duration-300", sidebarCollapsed ? "rotate-180" : "")}>
            <path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        
        {/* Logo */}
        <div className={cn("pt-1 pb-1 shrink-0 flex items-center justify-center border-b border-white/10 transition-all duration-300", sidebarCollapsed ? "px-2" : "px-4")}>
          {sidebarCollapsed ?
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
              <img src="https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/4bfbe29ea_IconJPEG01-01.jpg" alt="Q" className="w-full h-full object-cover" />
            </div> :

          <img
            src="https://media.base44.com/images/public/69de1a640d6bfab7b0c8ec08/5c8196497_ChatGPTImage24may202620_29_16.png"
            alt="Qualvia"
            className="h-20 w-full object-cover rounded-none my-1" />
          }
        </div>

        {/* Usuario interno */}
        {!sidebarCollapsed &&
        <div className="px-3 pt-4 pb-2 shrink-0">
            <SelectorUsuarioInterno />
          </div>
        }

        {/* Nav */}
        <nav className="px-2 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={() => setSidebarOpen(false)}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
            cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors",
              sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
              isActive ?
              "bg-[#FAFAF7]/15 text-[#FAFAF7] font-semibold" :
              "text-[#FAFAF7]/60 hover:bg-[#FAFAF7]/10 hover:text-[#FAFAF7]"
            )
            }>
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && label}
            </NavLink>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Negocio activo */}
        {!esOperario && !sidebarCollapsed &&
        <div className="px-3 pb-4 shrink-0">
            <div className="bg-white/10 rounded-xl px-3 py-2.5">
              <p className="text-[10px] font-semibold text-white/50 mb-1.5 uppercase tracking-wide">Negocio activo</p>
              <BusinessSelector />
            </div>
          </div>
        }

        {/* Usuario + Cerrar sesión */}
        <div className={cn("pb-5 pt-3 shrink-0 border-t border-white/10", sidebarCollapsed ? "px-1" : "px-3")}>
          <div className={cn("flex items-center gap-2 px-1 py-1", sidebarCollapsed ? "justify-center flex-col gap-1" : "")}>
            <div className="w-8 h-8 rounded-full bg-[#6BB68A] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.full_name || user?.email || "?")[0].toUpperCase()}
            </div>
            {!sidebarCollapsed &&
            <>
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
              </>
            }
            {sidebarCollapsed &&
            <button
              onClick={() => base44.auth.logout()}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            }
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