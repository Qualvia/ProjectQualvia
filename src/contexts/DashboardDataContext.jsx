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
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroLimpieza.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroAgua.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroRecepcion.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroMantenimiento.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroCongelacion.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroResiduo.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
      base44.entities.RegistroAlergeno.filter({ user_id: uid, business_id: bid, fecha: { $gte: fechaInicio90 } }),
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

  // Suscripciones en tiempo real — actualiza el contexto sin recargar todo
  useEffect(() => {
    if (!data) return;

    const unsubs = [
      base44.entities.Incidencia.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, incidencias: [...prev.incidencias, event.data] };
          if (event.type === "update") return { ...prev, incidencias: prev.incidencias.map((i) => i.id === event.id ? event.data : i) };
          if (event.type === "delete") return { ...prev, incidencias: prev.incidencias.filter((i) => i.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.TareaEjecucion.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, ejecuciones: [...prev.ejecuciones, event.data] };
          if (event.type === "update") return { ...prev, ejecuciones: prev.ejecuciones.map((e) => e.id === event.id ? event.data : e) };
          if (event.type === "delete") return { ...prev, ejecuciones: prev.ejecuciones.filter((e) => e.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.RegistroTemperatura.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, temperaturas: [...prev.temperaturas, event.data] };
          if (event.type === "update") return { ...prev, temperaturas: prev.temperaturas.map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, temperaturas: prev.temperaturas.filter((r) => r.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.RegistroLimpieza.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, limpiezas: [...prev.limpiezas, event.data] };
          if (event.type === "update") return { ...prev, limpiezas: prev.limpiezas.map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, limpiezas: prev.limpiezas.filter((r) => r.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.RegistroRecepcion.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, recepciones: [...prev.recepciones, event.data] };
          if (event.type === "update") return { ...prev, recepciones: prev.recepciones.map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, recepciones: prev.recepciones.filter((r) => r.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.ChecklistEjecucion.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, checklists: [...prev.checklists, event.data] };
          if (event.type === "update") return { ...prev, checklists: prev.checklists.map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, checklists: prev.checklists.filter((r) => r.id !== event.id) };
          return prev;
        });
      }),
      base44.entities.AuditoriaInterna.subscribe((event) => {
        setData((prev) => {
          if (!prev) return prev;
          if (event.type === "create") return { ...prev, auditorias: [...prev.auditorias, event.data] };
          if (event.type === "update") return { ...prev, auditorias: prev.auditorias.map((r) => r.id === event.id ? event.data : r) };
          if (event.type === "delete") return { ...prev, auditorias: prev.auditorias.filter((r) => r.id !== event.id) };
          return prev;
        });
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, [!!data]);

  return (
    <DashboardDataContext.Provider value={{ data, loading, recargar: cargar }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardDataContext);
}