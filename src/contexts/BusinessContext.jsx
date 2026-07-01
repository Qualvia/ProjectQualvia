import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const BusinessContext = createContext(null);

const STORAGE_KEY = "qualvia_active_business_id";

export function BusinessProvider({ children, authenticatedUser }) {
  const [user, setUser] = useState(authenticatedUser || null);

  // Un único objeto de estado para evitar renders intermedios entre setBusinesses / setCurrentBusiness / setIsLoading
  const [state, setState] = useState({
    businesses: [],
    currentBusiness: null,
    isLoading: true,
  });

  const loadBusinesses = useCallback(async (currentUser) => {
    const me = currentUser || user;
    if (!me) {
      setState({ businesses: [], currentBusiness: null, isLoading: false });
      return;
    }

    // Marcar como loading (sin tocar businesses/currentBusiness anteriores para no parpadear)
    setState((prev) => ({ ...prev, isLoading: true }));

    // Cargar solo los negocios donde user_id == ID real del usuario
    let list = await base44.entities.Business.filter({ user_id: me.id });

    // Retry si la lista está vacía pero hay un savedId en localStorage
    // (puede pasar por timing justo después del onboarding)
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (list.length === 0 && savedId) {
      await new Promise((r) => setTimeout(r, 800));
      list = await base44.entities.Business.filter({ user_id: me.id });
    }

    // Resolver negocio activo desde localStorage, validando contra lista real
    let current = null;
    if (list.length > 0) {
      const match = list.find((b) => b.id === savedId);
      // Si hay savedId pero no coincide con ningún negocio de la lista,
      // mantener el savedId en localStorage (puede ser un fallo temporal de red)
      // y solo hacer fallback a list[0] si realmente no había ningún savedId guardado.
      current = match || list[0];
      localStorage.setItem(STORAGE_KEY, current.id);
    }
    // Si list está vacía, NO tocar localStorage — puede ser un fallo temporal de red.
    // El savedId se mantendrá y se usará en la próxima carga exitosa.

    // Actualización ATÓMICA — un solo render, sin estados intermedios
    setState({ businesses: list, currentBusiness: current, isLoading: false });
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      setUser(authenticatedUser);
      loadBusinesses(authenticatedUser);
    } else {
      setState({ businesses: [], currentBusiness: null, isLoading: false });
    }
  }, [authenticatedUser]);

  // Cambiar negocio activo
  const setCurrentBusiness = useCallback((business) => {
    setState((prev) => ({ ...prev, currentBusiness: business }));
    localStorage.setItem(STORAGE_KEY, business.id);
  }, []);

  const createBusiness = useCallback(async (name) => {
    const newBiz = await base44.entities.Business.create({
      name,
      user_id: user.id,
    });
    setState((prev) => ({
      ...prev,
      businesses: [...prev.businesses, newBiz],
      currentBusiness: newBiz,
    }));
    localStorage.setItem(STORAGE_KEY, newBiz.id);
    return newBiz;
  }, [user]);

  const deleteBusiness = useCallback(async (id) => {
    // Borrado optimista: actualizar UI al instante, el borrado real va en segundo plano
    setState((prev) => {
      const updated = prev.businesses.filter((b) => b.id !== id);
      let next = prev.currentBusiness;
      if (prev.currentBusiness?.id === id) {
        next = updated[0] || null;
        if (next) localStorage.setItem(STORAGE_KEY, next.id);
        else localStorage.removeItem(STORAGE_KEY);
      }
      return { ...prev, businesses: updated, currentBusiness: next };
    });

    try {
      await base44.functions.invoke('deleteBusinessAndChildren', { business_id: id });
    } catch (error) {
      // Si falla, recargar lista desde servidor para restaurar el estado real
      await loadBusinesses(user);
      throw error;
    }
  }, [user, loadBusinesses]);

  return (
    <BusinessContext.Provider
      value={{
        user,
        businesses: state.businesses,
        setBusinesses: (list) => setState((prev) => ({ ...prev, businesses: list })),
        currentBusiness: state.currentBusiness,
        setCurrentBusiness,
        isLoading: state.isLoading,
        createBusiness,
        deleteBusiness,
        reloadBusinesses: loadBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error("useBusiness must be used within BusinessProvider");
  return ctx;
}