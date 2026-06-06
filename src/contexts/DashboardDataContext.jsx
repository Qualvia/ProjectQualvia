import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const DashboardDataContext = createContext(null);

export function DashboardDataProvider({ children }) {
  const { user, currentBusiness } = useBusiness();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const currentKeyRef = useRef(null);

  const cargar = useCallback(async () => {
    if (!user?.id || !currentBusiness?.id) return;
    // Evitar llamadas simultáneas
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;

    const fechaInicio90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    // Carga en dos lotes para evitar rate limit (max ~6 llamadas simultáneas)
    const [
      ejecuciones,
      incidencias,
      temperaturas,
      limpiezas,
      aguas,
      recepciones,
    ] = await Promise.all([
      base44.entities.TareaEjecucion.filter({ user_id: uid, business_id: bid }),
      base44.entities.Incidencia.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroLimpieza.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroAgua.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroRecepcion.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
    ]);

    const [
      mantenimientos,
      congelaciones,
      residuos,
      alergenos,
      checklists,
      auditorias,
      equipos,
    ] = await Promise.all([
      base44.entities.RegistroMantenimiento.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroCongelacion.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroResiduo.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroAlergeno.filter({ user_id: uid, business_id: bid, created_date: { $gte: fechaInicio90 } }),
      base44.entities.ChecklistEjecucion.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.AuditoriaInterna.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
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
    loadingRef.current = false;
  }, [user?.id, currentBusiness?.id]);

  // Un único useEffect — resetea y carga cuando cambia usuario o negocio
  useEffect(() => {
    const key = `${user?.id}_${currentBusiness?.id}`;
    if (!user?.id || !currentBusiness?.id) return;
    // Si ya cargamos para este par user/business, no relanzar
    if (currentKeyRef.current === key) return;
    currentKeyRef.current = key;
    loadingRef.current = false; // resetear guardia para nueva combinación
    setData(null);
    setLoading(true);
    cargar();
  }, [user?.id, currentBusiness?.id, cargar]);

  // Suscripciones en tiempo real — filtrando siempre por business_id activo
  useEffect(() => {
    if (!data || !currentBusiness?.id) return;
    const bid = currentBusiness.id;

    // Helper genérico que filtra por business_id antes de actualizar el estado
    function makeUpdater(key) {
      return (event) => {
        setData((prev) => {
          if (!prev) return prev;
          // Ignorar eventos de otros negocios
          if (event.data?.business_id && event.data.business_id !== bid) return prev;
          if (event.type === "create") return { ...prev, [key]: [...prev[key], event.data] };
          if (event.type === "update") return { ...prev, [key]: prev[key].map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, [key]: prev[key].filter((r) => r.id !== event.id) };
          return prev;
        });
      };
    }

    const unsubs = [
      base44.entities.Incidencia.subscribe(makeUpdater("incidencias")),
      base44.entities.TareaEjecucion.subscribe(makeUpdater("ejecuciones")),
      base44.entities.RegistroTemperatura.subscribe(makeUpdater("temperaturas")),
      base44.entities.RegistroLimpieza.subscribe(makeUpdater("limpiezas")),
      base44.entities.RegistroRecepcion.subscribe(makeUpdater("recepciones")),
      base44.entities.RegistroAgua.subscribe(makeUpdater("aguas")),
      base44.entities.RegistroMantenimiento.subscribe(makeUpdater("mantenimientos")),
      base44.entities.RegistroCongelacion.subscribe(makeUpdater("congelaciones")),
      base44.entities.RegistroResiduo.subscribe(makeUpdater("residuos")),
      base44.entities.RegistroAlergeno.subscribe(makeUpdater("alergenos")),
      base44.entities.ChecklistEjecucion.subscribe(makeUpdater("checklists")),
      base44.entities.AuditoriaInterna.subscribe(makeUpdater("auditorias")),
    ];

    return () => unsubs.forEach((u) => u());
  }, [currentBusiness?.id, !!data]); // !!data: re-suscribir cuando los datos iniciales llegan

  return (
    <DashboardDataContext.Provider value={{ data, loading, recargar: cargar }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardDataContext);
}