import React, { useState } from "react";
import GraficoCumplimiento from "./graficos/GraficoCumplimiento";
import GraficoTemperatura from "./graficos/GraficoTemperatura";
import GraficoIncidencias from "./graficos/GraficoIncidencias";

export default function GraficosBloque() {
  const [expandido, setExpandido] = useState(null); // null | "cumplimiento" | "temperatura" | "incidencias"

  return (
    <div className="p-4">
      <div
        className="transition-all duration-300"
        style={{ display: expandido ? "block" : undefined }}>

        {/* Vista compacta: grid 3 columnas */}
        {!expandido && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <GraficoCumplimiento
              expandido={false}
              onExpand={() => setExpandido("cumplimiento")}
            />
            <GraficoTemperatura
              expandido={false}
              onExpand={() => setExpandido("temperatura")}
            />
            <GraficoIncidencias
              expandido={false}
              onExpand={() => setExpandido("incidencias")}
            />
          </div>
        )}

        {/* Vista expandida */}
        {expandido === "cumplimiento" && (
          <GraficoCumplimiento
            expandido={true}
            onCollapse={() => setExpandido(null)}
          />
        )}
        {expandido === "temperatura" && (
          <GraficoTemperatura
            expandido={true}
            onCollapse={() => setExpandido(null)}
          />
        )}
        {expandido === "incidencias" && (
          <GraficoIncidencias
            expandido={true}
            onCollapse={() => setExpandido(null)}
          />
        )}
      </div>
    </div>
  );
}