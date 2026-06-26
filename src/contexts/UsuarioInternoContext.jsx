import React, { createContext, useContext, useState } from "react";

const UsuarioInternoContext = createContext(null);

export function UsuarioInternoProvider({ children }) {
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    try {
      const saved = sessionStorage.getItem("qualvia_usuario_activo");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }); // null = propietario

  // true solo cuando hay un usuario interno con rol "operario"
  const esOperario = usuarioActivo?.rol === "operario";
  // true cuando hay un usuario interno (operario o administrador) o propietario
  const nombreRegistrador = usuarioActivo?.nombre || null; // null = propietario

  function cambiarUsuarioActivo(usuario) {
    if (usuario) {
      sessionStorage.setItem("qualvia_usuario_activo", JSON.stringify(usuario));
    } else {
      sessionStorage.removeItem("qualvia_usuario_activo");
    }
    setUsuarioActivo(usuario);
  }

  return (
    <UsuarioInternoContext.Provider value={{ usuarioActivo, setUsuarioActivo: cambiarUsuarioActivo, esOperario, nombreRegistrador }}>
      {children}
    </UsuarioInternoContext.Provider>
  );
}

export function useUsuarioInterno() {
  return useContext(UsuarioInternoContext);
}