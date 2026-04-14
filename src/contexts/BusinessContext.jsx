import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const BusinessContext = createContext(null);

const STORAGE_KEY = "qualvia_active_business_id";

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    const me = await base44.auth.me();
    setUser(me);

    const list = await base44.entities.Business.filter({ user_id: me.email });
    setBusinesses(list);

    // Resolve active business
    const savedId = localStorage.getItem(STORAGE_KEY);
    const saved = list.find((b) => b.id === savedId);

    if (saved) {
      setCurrentBusiness(saved);
    } else if (list.length > 0) {
      setCurrentBusiness(list[0]);
      localStorage.setItem(STORAGE_KEY, list[0].id);
    } else {
      setCurrentBusiness(null);
      localStorage.removeItem(STORAGE_KEY);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const switchBusiness = useCallback((business) => {
    setCurrentBusiness(business);
    localStorage.setItem(STORAGE_KEY, business.id);
  }, []);

  const createBusiness = useCallback(async (name) => {
    const newBiz = await base44.entities.Business.create({
      name,
      user_id: user.email,
    });
    const updated = [...businesses, newBiz];
    setBusinesses(updated);
    switchBusiness(newBiz);
    return newBiz;
  }, [user, businesses, switchBusiness]);

  return (
    <BusinessContext.Provider
      value={{
        user,
        businesses,
        currentBusiness,
        isLoading,
        switchBusiness,
        createBusiness,
        reloadBusinesses: loadBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }
  return ctx;
}