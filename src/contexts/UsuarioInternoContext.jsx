import React, { createContext, useContext, useState } from "react";

const UsuarioInternoContext = createContext(null);

export function UsuarioInternoProvider({ children }) {
  const [usuarioActivo, setUsuarioActivo] = useState(null); // null = propietario

  // true solo cuando hay un usuario interno con rol "operario"
  const esOperario = usuarioActivo?.rol === "operario";
  // true cuando hay un usuario interno (operario o administrador) o propietario
  const nombreRegistrador = usuarioActivo?.nombre || null; // null = propietario

  return (
    <UsuarioInternoContext.Provider value={{ usuarioActivo, setUsuarioActivo, esOperario, nombreRegistrador }}>
      {children}
    </UsuarioInternoContext.Provider>
  );
}

export function useUsuarioInterno() {
  return useContext(UsuarioInternoContext);
}