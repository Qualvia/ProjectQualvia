import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Line, ComposedChart, Legend,
} from "recharts";
import { AlertTriangle, Maximize2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const PERIODOS = [
  { value: "semanal",    label: "Sem", desc: "Últimas 8 semanas" },
  { value: "mensual",    label: "1M",  desc: "Último mes (por semanas)" },
  { value: "trimestral", label: "3M",  desc: "Últimos 3 meses" },
  { value: "semestral",  label: "6M",  desc: "Últimos 6 meses" },
  { value: "anual",      label: "1A",  desc: "Últimos 12 meses" },
  { value: "bianual",    label: "2A",  desc: "Últimos 24 meses" },
];

function getPeriodoBuckets(periodo) {
  const ahora = new Date();
  const buckets = [];

  if (periodo === "semanal") {
    // Últimas 8 semanas
    for (let i = 7; i >= 0; i--) {
      const inicio = new Date(ahora);
      inicio.setDate(ahora.getDate() - i * 7);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(inicio);
      fin.setDate(inicio.getDate() + 6);
      fin.setHours(23, 59, 59, 999);
      const label = `${String(inicio.getDate()).padStart(2,"0")}/${String(inicio.getMonth()+1).padStart(2,"0")}`;
      buckets.push({ label, inicio, fin });
    }
  } else if (periodo === "mensual") {
    // Último mes por semanas (~4-5 semanas)
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
    let cur = new Date(inicioMes);
    while (cur <= finMes) {
      const ini = new Date(cur);
      const fin = new Date(cur);
      fin.setDate(fin.getDate() + 6);
      if (fin > finMes) fin.setTime(finMes.getTime());
      const label = `${String(ini.getDate()).padStart(2,"0")}/${String(ini.getMonth()+1).padStart(2,"0")}`;
      buckets.push({ label, inicio: ini, fin });
      cur.setDate(cur.getDate() + 7);
    }
  } else {
    const numMeses = periodo === "trimestral" ? 3 : periodo === "semestral" ? 6 : periodo === "anual" ? 12 : 24;
    const mostrarAño = numMeses > 6;
    for (let i = numMeses - 1; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      const fin = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = `${MESES[d.getMonth()]}${mostrarAño ? ` '${String(d.getFullYear()).slice(2)}` : ""}`;
      buckets.push({ label, inicio: d, fin });
    }
  }
  return buckets;
}

const CustomTooltipInc = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const cerradas = payload.find(p => p.dataKey === "cerradas")?.value ?? 0;
  const seguimiento = payload.find(p => p.dataKey === "seguimiento")?.value ?? 0;
  const abiertas = payload.find(p => p.dataKey === "abiertas")?.value ?? 0;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[140px]">
      <p className="font-semibold text-[#0A3E47]">{label}</p>
      <p>Total: <span className="font-bold">{cerradas + seguimiento + abiertas}</span></p>
      <p className="text-[#6BB68A]">Cerradas: {cerradas}</p>
      <p className="text-blue-400">En seguimiento: {seguimiento}</p>
      <p className="text-red-400">Abiertas: {abiertas}</p>
    </div>
  );
};

export default function GraficoIncidencias({ expandido, onExpand, onCollapse }) {
  const { user, currentBusiness } = useBusiness();
  const [periodo, setPeriodo] = useState("semestral");
  const [todasIncidencias, setTodasIncidencias] = useState([]);
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
    setTodasIncidencias(todas);

    const cerradasTotal = todas.filter(i => i.estado === "cerrada").length;
    const tasaResolucion = todas.length > 0 ? Math.round((cerradasTotal / todas.length) * 100) : 0;
    const totalConFecha = todas.filter(i => i.fecha_cierre && i.fecha && new Date(i.fecha_cierre) > new Date(i.fecha));
    const tiempoMedio = totalConFecha.length > 0
      ? Math.round(totalConFecha.reduce((s, i) => s + (new Date(i.fecha_cierre) - new Date(i.fecha)) / (1000 * 3600 * 24), 0) / totalConFecha.length)
      : null;

    setResumen({ tasaResolucion, tiempoMedio });
    setLoading(false);
  }

  // Recalcular data y tendencia cuando cambia periodo o datos
  const dataExpandido = useMemo(() => {
    const buckets = getPeriodoBuckets(periodo);
    return buckets.map(({ label, inicio, fin }) => {
      const del_bucket = todasIncidencias.filter(i => {
        const f = new Date(i.fecha || i.created_date);
        return f >= inicio && f <= fin;
      });
      return {
        label,
        cerradas: del_bucket.filter(i => i.estado === "cerrada").length,
        seguimiento: del_bucket.filter(i => i.estado === "seguimiento").length,
        abiertas: del_bucket.filter(i => i.estado === "abierta").length,
        total: del_bucket.length,
      };
    });
  }, [periodo, todasIncidencias]);

  const dataCompacto = useMemo(
    () => dataExpandido.map(d => ({ label: d.label, cerradas: d.cerradas, seguimiento: d.seguimiento, abiertas: d.abiertas, total: d.total })),
    [dataExpandido]
  );

  // Recalcular tendencia y mesPico
  useEffect(() => {
    if (!dataExpandido.length) return;
    const mesesConDatos = dataExpandido.filter(d => d.total > 0);
    if (mesesConDatos.length >= 2) {
      const mitad = Math.floor(mesesConDatos.length / 2);
      const primera = mesesConDatos.slice(0, mitad).reduce((s, d) => s + d.total, 0);
      const segunda = mesesConDatos.slice(mitad).reduce((s, d) => s + d.total, 0);
      if (segunda < primera) setTendencia("baja");
      else if (segunda > primera) setTendencia("sube");
      else setTendencia("igual");
    } else {
      setTendencia(null);
    }
    const mesPico = dataExpandido.reduce((max, d) => d.total > (max?.total ?? 0) ? d : max, null);
    setResumen(prev => ({ ...prev, mesPico: mesPico?.total > 0 ? mesPico.label : null }));
  }, [dataExpandido]);

  const hayDatos = dataCompacto.some(d => d.total > 0);

  // Calcula ticks de 2 en 2 para el eje Y
  function getYTicks(data) {
    const maxVal = Math.max(...data.map(d => d.total), 2);
    const top = maxVal % 2 === 0 ? maxVal : maxVal + 1;
    const ticks = [];
    for (let i = 0; i <= top; i += 2) ticks.push(i);
    return ticks;
  }

  const tendenciaInfo = {
    baja: { texto: "↓ Tendencia positiva", color: "#16A34A" },
    sube: { texto: "↑ Atención, tendencia al alza", color: "#DC2626" },
    igual: { texto: "→ Sin cambios significativos", color: "#6B7280" },
  };

  const periodoDesc = PERIODOS.find(p => p.value === periodo)?.desc ?? "";

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
          </button>
          <div className="flex gap-1">
            {PERIODOS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriodo(p.value)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                  periodo === p.value
                    ? "bg-[#0A3E47] border-[#0A3E47] text-white"
                    : "bg-white border-border text-muted-foreground hover:border-[#0A3E47]/40"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-base font-semibold text-[#0A3E47]">Incidencias · {periodoDesc}</h3>

        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
          </div>
        ) : !hayDatos ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <AlertTriangle className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin incidencias registradas en este periodo</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={dataExpandido} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} ticks={getYTicks(dataExpandido)} domain={[0, getYTicks(dataExpandido).at(-1)]} />
                <Tooltip content={<CustomTooltipInc />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} formatter={(v) => v === "cerradas" ? "Cerradas" : v === "seguimiento" ? "En seguimiento" : v === "abiertas" ? "Abiertas" : v} />
                <Bar dataKey="cerradas" stackId="a" fill="#6BB68A" radius={[0, 0, 0, 0]} />
                <Bar dataKey="seguimiento" stackId="a" fill="#BFDBFE" radius={[0, 0, 0, 0]} />
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
                <p className="text-[11px] text-muted-foreground mt-0.5">Período con más incidencias</p>
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

  // Vista compacta
  return (
    <div
      onClick={onExpand}
      className="relative bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-3 cursor-pointer group hover:shadow-md hover:border-[#6BB68A]/40 transition-all h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4.5 h-4.5 text-[#0A3E47]" />
          <span className="text-sm font-semibold text-[#0A3E47]">Incidencias</span>
        </div>
        <div className="flex items-center gap-1.5">
          <select
            value={periodo}
            onChange={e => { e.stopPropagation(); setPeriodo(e.target.value); }}
            onClick={e => e.stopPropagation()}
            className="text-[10px] text-[#0A3E47] font-medium border border-[#0A3E47]/30 rounded-md px-1.5 py-0.5 bg-transparent focus:outline-none cursor-pointer appearance-none">
            {PERIODOS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
        </div>
      ) : !hayDatos ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-1.5">
          <AlertTriangle className="w-6 h-6 text-muted-foreground/30" />
          <p className="text-[11px] text-muted-foreground text-center leading-tight">Aún no hay incidencias<br />registradas</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataCompacto} margin={{ top: 6, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F0EBE3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#9A9289" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: "#9A9289" }} tickLine={false} axisLine={false} width={24} ticks={getYTicks(dataCompacto)} domain={[0, getYTicks(dataCompacto).at(-1)]} />
              <Tooltip content={<CustomTooltipInc />} />
              <Bar dataKey="cerradas" stackId="a" fill="#6BB68A" radius={[0, 0, 0, 0]} />
              <Bar dataKey="seguimiento" stackId="a" fill="#BFDBFE" radius={[0, 0, 0, 0]} />
              <Bar dataKey="abiertas" stackId="a" fill="#FECACA" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}