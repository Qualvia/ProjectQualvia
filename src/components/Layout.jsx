import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { base44 } from "@/api/base44Client";
import BusinessSelector from "@/components/BusinessSelector";
import CreateBusinessDialog from "@/components/CreateBusinessDialog";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  CheckSquare,
  Bot,
  Settings,
  Building2,
  Plus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/registros", label: "Registros", icon: ClipboardList },
  { to: "/documentos", label: "Documentos", icon: FileText },
  { to: "/checklist", label: "Checklist", icon: CheckSquare },
  { to: "/asistente", label: "Asistente", icon: Bot },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
];

export default function Layout() {
  const { user, businesses, isLoading } = useBusiness();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-foreground">Bienvenido a Qualvia</h1>
            <p className="text-sm text-muted-foreground">
              Crea tu primer negocio para comenzar.
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Crear negocio
          </Button>
          <CreateBusinessDialog open={showCreate} onOpenChange={setShowCreate} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col transition-transform duration-200",
          "bg-[#0A3E47]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 shrink-0 border-b border-white/10">
          <span className="text-lg font-semibold tracking-tight text-white">Qualvia</span>
        </div>

        {/* Business selector */}
        <div className="px-3 py-3 border-b border-white/10 shrink-0">
          <BusinessSelector />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#6BB68A] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/10 shrink-0 space-y-1">
          <p className="text-xs text-white/50 truncate px-3">
            {user?.email}
          </p>
          <button
            onClick={() => base44.auth.logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
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
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <span className="text-base font-semibold text-white">Qualvia</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}