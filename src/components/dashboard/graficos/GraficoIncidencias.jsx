import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Line, ComposedChart, Legend,
} from "recharts";
import { AlertTriangle, Maximize2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function getLast6Months() {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    result.push({ año: d.getFullYear(), mes: d.getMonth(), label: MESES[d.getMonth()] });
  }
  return result;
}

const CustomTooltipInc = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const cerradas = payload.find(p => p.dataKey === "cerradas")?.value ?? 0;
  const abiertas = payload.find(p => p.dataKey === "abiertas")?.value ?? 0;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[140px]">
      <p className="font-semibold text-[#0A3E47]">{label}</p>
      <p>Total: <span className="font-bold">{cerradas + abiertas}</span></p>
      <p className="text-[#6BB68A]">Cerradas: {cerradas}</p>
      <p className="text-red-400">Abiertas: {abiertas}</p>
    </div>
  );
};

export default function GraficoIncidencias({ expandido, onExpand, onCollapse }) {
  const { user, currentBusiness } = useBusiness();
  const [dataCompacto, setDataCompacto] = useState([]);
  const [dataExpandido, setDataExpandido] = useState([]);
  const [tendencia, setTendencia] = useState(null);
  const [resumen, setResumen] = useState({ mesPico: null, tasaResolucion: 0, tiempoMedio: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;
    cargar();
  }, [user?.id, currentBusiness?.id]);

  async function cargar() {
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;

    const todas = await base44.entities.Incidencia.filter({ user_id: uid, business_id: bid });
    const meses = getLast6Months();

    const dataExp = meses.map(({ año, mes, label }) => {
      const del_mes = todas.filter(i => {
        const f = new Date(i.fecha || i.created_date);
        return f.getFullYear() === año && f.getMonth() === mes;
      });
      return {
        label,
        cerradas: del_mes.filter(i => i.estado === "cerrada").length,
        abiertas: del_mes.filter(i => i.estado !== "cerrada").length,
        total: del_mes.length,
      };
    });
    setDataExpandido(dataExp);
    setDataCompacto(dataExp.map(d => ({ label: d.label, total: d.total })));

    // Tendencia: compara primer mitad vs segunda mitad
    const primera = dataExp.slice(0, 3).reduce((s, d) => s + d.total, 0);
    const segunda = dataExp.slice(3).reduce((s, d) => s + d.total, 0);
    if (segunda < primera) setTendencia("baja");
    else if (segunda > primera) setTendencia("sube");
    else setTendencia("igual");

    // Resumen
    const mesPico = dataExp.reduce((max, d) => d.total > (max?.total ?? 0) ? d : max, null);
    const totalConFecha = todas.filter(i => i.fecha_cierre && i.fecha);
    const tiempoMedio = totalConFecha.length > 0
      ? Math.round(totalConFecha.reduce((s, i) => {
          const diff = new Date(i.fecha_cierre) - new Date(i.fecha);
          return s + diff / (1000 * 3600 * 24);
        }, 0) / totalConFecha.length)
      : null;
    const cerradasTotal = todas.filter(i => i.estado === "cerrada").length;
    const tasaResolucion = todas.length > 0 ? Math.round((cerradasTotal / todas.length) * 100) : 0;
    setResumen({ mesPico: mesPico?.total > 0 ? mesPico.label : null, tasaResolucion, tiempoMedio });
    setLoading(false);
  }

  const hayDatos = dataCompacto.some(d => d.total > 0);

  const tendenciaInfo = {
    baja: { texto: "↓ Tendencia positiva", color: "#16A34A" },
    sube: { texto: "↑ Atención, tendencia al alza", color: "#DC2626" },
    igual: { texto: "→ Sin cambios significativos", color: "#6B7280" },
  };

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
        </button>
        <h3 className="text-base font-semibold text-[#0A3E47]">Incidencias · Últimos 6 meses</h3>

        {!hayDatos ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin incidencias registradas en los últimos 6 meses</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={dataExpandido} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltipInc />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} formatter={(v) => v === "cerradas" ? "Cerradas" : "Abiertas"} />
                <Bar dataKey="cerradas" stackId="a" fill="#6BB68A" radius={[0, 0, 0, 0]} />
                <Bar dataKey="abiertas" stackId="a" fill="#FECACA" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="#9CA3AF" strokeDasharray="5 3" strokeWidth={1.5} dot={false} legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>

            {tendencia && (
              <p className="text-sm font-medium" style={{ color: tendenciaInfo[tendencia].color }}>
                {tendenciaInfo[tendencia].texto}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#0A3E47]">{resumen.mesPico ?? "—"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Mes con más incidencias</p>
              </div>
              <div className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#0A3E47]">{resumen.tasaResolucion}%</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tasa de resolución</p>
              </div>
              <div className="bg-[#F8F5F0] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#0A3E47]">{resumen.tiempoMedio != null ? `${resumen.tiempoMedio}d` : "—"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Tiempo medio resolución</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onExpand}
      className="relative bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-3 cursor-pointer group hover:shadow-md hover:border-[#6BB68A]/40 transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-[#0A3E47]" />
          <span className="text-xs font-semibold text-[#0A3E47]">Incidencias</span>
        </div>
        <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {!hayDatos ? (
        <div className="flex items-center justify-center h-[120px]">
          <p className="text-[11px] text-muted-foreground text-center">Sin incidencias<br/>registradas</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={dataCompacto}>
            <Bar dataKey="total" fill="#FECACA" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}