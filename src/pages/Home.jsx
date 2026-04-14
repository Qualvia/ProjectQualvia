import React, { useState } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import BusinessSelector from "@/components/BusinessSelector";
import CreateBusinessDialog from "@/components/CreateBusinessDialog";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Shield, Database, Link } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, businesses, currentBusiness, isLoading } = useBusiness();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // No businesses yet — onboarding
  if (businesses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenido a Qualvia
            </h1>
            <p className="text-muted-foreground">
              Crea tu primer negocio para comenzar.
            </p>
          </div>
          <Button size="lg" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            Crear mi primer negocio
          </Button>
          <CreateBusinessDialog open={showCreate} onOpenChange={setShowCreate} />
        </motion.div>
      </div>
    );
  }

  // Has businesses — dashboard placeholder
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold tracking-tight text-primary">
              Qualvia
            </span>
            <BusinessSelector />
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.full_name || user?.email}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {currentBusiness?.name}
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de administración
            </p>
          </div>

          {/* Architecture info cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <InfoCard
              icon={Shield}
              title="Aislamiento"
              description="Cada negocio está aislado. Solo el dueño puede ver y modificar sus datos."
            />
            <InfoCard
              icon={Database}
              title="business_id"
              description="Toda entidad futura dependerá de business_id para garantizar separación."
            />
            <InfoCard
              icon={Link}
              title="Sin intermediarios"
              description="Relación directa: User → Business. Sin tablas intermedias ni roles complejos."
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
        <Icon className="w-5 h-5 text-accent-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}