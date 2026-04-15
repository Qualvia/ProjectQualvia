import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
// user viene como prop desde AuthContext — no se llama a base44.auth.me() aquí

const BusinessContext = createContext(null);

const STORAGE_KEY = "qualvia_active_business_id";

export function BusinessProvider({ children, authenticatedUser }) {
  const [user, setUser] = useState(authenticatedUser || null);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusinessState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadBusinesses = useCallback(async (currentUser) => {
    const me = currentUser || user;
    if (!me) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Cargar solo los negocios donde user_id == ID real del usuario
    let list = await base44.entities.Business.filter({ user_id: me.id });

    // Retry si la lista está vacía pero hay un savedId en localStorage
    // (puede pasar por timing justo después del onboarding)
    const savedId = localStorage.getItem(STORAGE_KEY);
    if (list.length === 0 && savedId) {
      await new Promise((r) => setTimeout(r, 800));
      list = await base44.entities.Business.filter({ user_id: me.id });
    }

    setBusinesses(list);

    // Resolver negocio activo desde localStorage, validando contra lista real
    const match = list.find((b) => b.id === savedId);

    if (match) {
      setCurrentBusinessState(match);
    } else if (list.length > 0) {
      setCurrentBusinessState(list[0]);
      localStorage.setItem(STORAGE_KEY, list[0].id);
    } else {
      setCurrentBusinessState(null);
      localStorage.removeItem(STORAGE_KEY);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authenticatedUser) {
      setUser(authenticatedUser);
      loadBusinesses(authenticatedUser);
    } else {
      setIsLoading(false);
    }
  }, [authenticatedUser]);

  // Cambiar negocio activo — permite pasar uno recién creado (no validado contra lista)
  const setCurrentBusiness = useCallback((business) => {
    setCurrentBusinessState(business);
    localStorage.setItem(STORAGE_KEY, business.id);
  }, []);

  const createBusiness = useCallback(async (name) => {
    const newBiz = await base44.entities.Business.create({
      name,
      user_id: user.id,
    });
    const updated = [...businesses, newBiz];
    setBusinesses(updated);
    setCurrentBusinessState(newBiz);
    localStorage.setItem(STORAGE_KEY, newBiz.id);
    return newBiz;
  }, [user, businesses]);

  const deleteBusiness = useCallback(async (id) => {
    try {
      await base44.functions.invoke('deleteBusinessAndChildren', { business_id: id });
      const updated = businesses.filter((b) => b.id !== id);
      setBusinesses(updated);
      if (currentBusiness?.id === id) {
        const next = updated[0] || null;
        setCurrentBusinessState(next);
        if (next) localStorage.setItem(STORAGE_KEY, next.id);
        else localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      // Si falla, recargar lista desde servidor para mantener sincronización
      await loadBusinesses(user);
      throw error;
    }
  }, [businesses, currentBusiness, user, loadBusinesses]);

  return (
    <BusinessContext.Provider
      value={{
        user,
        businesses,
        setBusinesses,
        currentBusiness,
        setCurrentBusiness,
        isLoading,
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