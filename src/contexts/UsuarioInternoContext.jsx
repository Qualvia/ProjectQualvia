import React, { createContext, useContext, useState } from "react";

const UsuarioInternoContext = createContext(null);

export function UsuarioInternoProvider({ children }) {
  const [usuarioActivo, setUsuarioActivo] = useState(null); // null = propietario

  return (
    <UsuarioInternoContext.Provider value={{ usuarioActivo, setUsuarioActivo }}>
      {children}
    </UsuarioInternoContext.Provider>
  );
}

export function useUsuarioInterno() {
  return useContext(UsuarioInternoContext);
}