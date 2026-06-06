import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({ children }) {
  const { user, currentBusiness } = useBusiness();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) return;
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;

    const [
      ejecuciones,
      incidencias,
      temperaturas,
      limpiezas,
      aguas,
      recepciones,
      mantenimientos,
      congelaciones,
      residuos,
      alergenos,
      checklists,
      auditorias,
      equipos,
    ] = await Promise.all([
      base44.entities.TareaEjecucion.filter({ user_id: uid, business_id: bid }),
      base44.entities.Incidencia.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroLimpieza.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroAgua.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroRecepcion.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroMantenimiento.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroCongelacion.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroResiduo.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroAlergeno.filter({ user_id: uid, business_id: bid }),
      base44.entities.ChecklistEjecucion.filter({ user_id: uid, business_id: bid }),
      base44.entities.AuditoriaInterna.filter({ user_id: uid, business_id: bid }),
      base44.entities.EquipoTemperatura.filter({ user_id: uid, business_id: bid }),
    ]);

    setData({
      ejecuciones,
      incidencias,
      temperaturas,
      limpiezas,
      aguas,
      recepciones,
      mantenimientos,
      congelaciones,
      residuos,
      alergenos,
      checklists,
      auditorias,
      equipos,
    });
    setLoading(false);
  }, [user?.id, currentBusiness?.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Resetear al cambiar negocio
  useEffect(() => {
    setData(null);
    setLoading(true);
  }, [user?.id, currentBusiness?.id]);

  return (
    <DashboardDataContext.Provider value={{ data, loading, recargar: cargar }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardDataContext);
}