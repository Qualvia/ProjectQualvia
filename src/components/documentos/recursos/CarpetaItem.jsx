import React, { useState, useRef, useEffect } from "react";
import { Folder, MoreVertical, Pencil, Trash2, GripVertical } from "lucide-react";

export default function CarpetaItem({ carpeta, onOpen, onRename, onDelete, dragHandleProps }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div
      className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-4 cursor-pointer hover:border-[#6BB68A] transition-colors group"
      onClick={() => onOpen(carpeta)}
    >
      {/* Drag handle */}
      <div
        {...dragHandleProps}
        onClick={(e) => e.stopPropagation()}
        className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing shrink-0"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Icono carpeta */}
      <div className="w-10 h-10 rounded-lg bg-[#6BB68A]/15 flex items-center justify-center shrink-0">
        <Folder className="w-6 h-6 text-[#3d8a5e]" fill="#6BB68A" fillOpacity={0.4} />
      </div>

      {/* Nombre */}
      <span className="flex-1 font-bold text-foreground text-[15px]">{carpeta.nombre}</span>

      {/* Menú opciones */}
      <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-30 w-44 bg-white border border-border rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => { setMenuOpen(false); onRename(carpeta); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Editar nombre
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(carpeta); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}