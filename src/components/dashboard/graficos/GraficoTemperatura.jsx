import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import { Thermometer, Maximize2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const LINE_COLORS = ["#0A3E47", "#6BB68A", "#D97706", "#9333EA", "#0891B2", "#DC2626", "#65A30D"];

const PERIODOS = [
  { value: "7d", label: "7d", dias: 7 },
  { value: "14d", label: "14d", dias: 14 },
  { value: "30d", label: "30d", dias: 30 },
];

function formatDD_MM(isoStr) {
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// Para 14d y 30d filtra etiquetas para no saturar el eje X
function filtrarEtiquetasX(dias, periodo) {
  if (periodo === "7d") return null; // muestra todas
  const intervalo = periodo === "14d" ? 2 : 5; // cada 2 días para 14d, cada 5 para 30d
  return (value, index) => index % intervalo === 0 ? value : "";
}

const CustomTooltipTemp = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[180px]">
      <p className="font-semibold text-[#0A3E47]">{label}</p>
      {payload.map((p) => {
        const fuera = p.payload[`_meta_${p.dataKey}`]?.fuera;
        return (
          <div key={p.dataKey} className="flex items-center gap-1.5">
            <span style={{ color: p.color }}>●</span>
            <span>{p.dataKey}: </span>
            <span className={`font-bold ${fuera ? "text-red-500" : "text-foreground"}`}>{p.value}°C</span>
            {fuera && <span className="text-red-500 text-[10px]">⚠ fuera rango</span>}
          </div>
        );
      })}
    </div>
  );
};

export default function GraficoTemperatura({ expandido, onExpand, onCollapse }) {
  const { user, currentBusiness } = useBusiness();
  const [data, setData] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [todosEquipos, setTodosEquipos] = useState([]);
  const [limites, setLimites] = useState({});
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("7d");
  // Guardamos los registros recientes para recalcular dominio Y
  const [registrosRecientes, setRegistrosRecientes] = useState([]);

  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;
    cargar();
  }, [user?.id, currentBusiness?.id, periodo]);

  async function cargar() {
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;
    const diasNum = PERIODOS.find(p => p.value === periodo)?.dias || 7;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasNum);

    const [registros, eqs] = await Promise.all([
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid }),
      base44.entities.EquipoTemperatura.filter({ user_id: uid, business_id: bid }),
    ]);

    const recientes = registros.filter(r => r.fecha && new Date(r.fecha) >= fechaInicio);
    const dias = getLastNDays(diasNum);

    const limitesMap = {};
    eqs.forEach(eq => {
      limitesMap[eq.id] = { nombre: eq.nombre, tipo: eq.tipo || "Otro", min: eq.temp_min, max: eq.temp_max };
    });

    const todosEqs = eqs.map((eq, i) => ({
      id: eq.id,
      nombre: eq.nombre,
      tipo: eq.tipo || "Otro",
      color: LINE_COLORS[i % LINE_COLORS.length],
    }));
    setTodosEquipos(todosEqs);

    const tipos = ["todos", ...new Set(eqs.map(eq => eq.tipo || "Otro").filter(Boolean))];
    setTiposDisponibles(tipos);

    const equiposIds = [...new Set(recientes.map(r => r.equipo_id))];
    const equiposConDatos = equiposIds.map((id, i) => ({
      id,
      nombre: limitesMap[id]?.nombre || id,
      tipo: limitesMap[id]?.tipo || "Otro",
      color: LINE_COLORS[i % LINE_COLORS.length],
    }));
    setEquipos(equiposConDatos);
    setLimites(limitesMap);
    setRegistrosRecientes(recientes);

    const chartData = dias.map(dia => {
      const row = { fecha: formatDD_MM(dia + "T12:00:00") };
      equiposIds.forEach(eqId => {
        const regsDelDia = recientes.filter(r => r.equipo_id === eqId && r.fecha?.slice(0, 10) === dia);
        if (regsDelDia.length > 0) {
          const avg = regsDelDia.reduce((s, r) => s + r.temperatura, 0) / regsDelDia.length;
          const val = Math.round(avg * 10) / 10;
          const lim = limitesMap[eqId];
          const fuera = lim && (val < lim.min || val > lim.max);
          row[limitesMap[eqId]?.nombre || eqId] = val;
          row[`_meta_${limitesMap[eqId]?.nombre || eqId}`] = { fuera };
        }
      });
      return row;
    });
    setData(chartData);

    const res = equiposIds.map((eqId, i) => {
      const regsEq = recientes.filter(r => r.equipo_id === eqId);
      const media = regsEq.length > 0
        ? Math.round((regsEq.reduce((s, r) => s + r.temperatura, 0) / regsEq.length) * 10) / 10
        : null;
      const lim = limitesMap[eqId];
      const alertas = regsEq.filter(r => lim && (r.temperatura < lim.min || r.temperatura > lim.max)).length;
      const diasConReg = new Set(regsEq.map(r => r.fecha?.slice(0, 10))).size;
      return {
        id: eqId,
        nombre: limitesMap[eqId]?.nombre || eqId,
        tipo: limitesMap[eqId]?.tipo || "Otro",
        media, alertas, diasConReg,
        color: LINE_COLORS[i % LINE_COLORS.length],
      };
    });
    setResumen(res);
    setLoading(false);
  }

  const equiposMostrar = filtroTipo === "todos" ? equipos : equipos.filter(e => e.tipo === filtroTipo);
  const equiposDelTipo = filtroTipo === "todos" ? todosEquipos : todosEquipos.filter(e => e.tipo === filtroTipo);

  const hayDatos = !loading && equipos.length > 0 && data.some(d => equipos.some(eq => d[eq.nombre] != null));

  // Dominio Y: considera valores reales + límites de equipos mostrados, con margen ±3
  function getYDomain() {
    const eqsRef = equiposMostrar.length > 0 ? equiposMostrar : equipos;
    const valoresReales = registrosRecientes
      .filter(r => eqsRef.some(eq => eq.id === r.equipo_id))
      .map(r => r.temperatura)
      .filter(v => v != null);

    const limiteVals = eqsRef.flatMap(eq => {
      const lim = limites[eq.id];
      if (!lim) return [];
      return [lim.min, lim.max].filter(v => v != null);
    });

    const todos = [...valoresReales, ...limiteVals];
    if (todos.length === 0) return ["auto", "auto"];

    const minGlobal = Math.min(...todos);
    const maxGlobal = Math.max(...todos);
    return [Math.floor(minGlobal - 3), Math.ceil(maxGlobal + 3)];
  }

  const xTickFormatter = filtrarEtiquetasX([], periodo);

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        {/* Header con botón volver + filtros */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
          </button>
          <div className="flex gap-1.5 flex-wrap justify-end items-center">
            {/* Selector de periodo */}
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
            <div className="w-px h-4 bg-border mx-1" />
            {/* Filtro por tipo */}
            {tiposDisponibles.map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
                  filtroTipo === tipo
                    ? "bg-[#E4F2EC] border-[#6BB68A] text-[#0A3E47]"
                    : "bg-white border-border text-muted-foreground hover:border-[#6BB68A]/50"
                }`}>
                {tipo === "todos" ? "Todos" : tipo}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-base font-semibold text-[#0A3E47]">
          Temperatura equipos · Últimos {PERIODOS.find(p => p.value === periodo)?.dias} días
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-[280px]">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
          </div>
        ) : !hayDatos ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Thermometer className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin registros de temperatura en este periodo</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 11 }}
                tickFormatter={xTickFormatter || undefined}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={v => `${v}°`}
                domain={getYDomain()}
                allowDataOverflow={false}
              />
              <Tooltip content={<CustomTooltipTemp />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {equiposMostrar.map(eq => {
                // Contamos puntos con valor para este equipo en el periodo actual
                const puntosConValor = data.filter(d => d[eq.nombre] != null).length;
                const esAislado = puntosConValor <= 2;
                return (
                  <Line
                    key={eq.id}
                    type="monotone"
                    dataKey={eq.nombre}
                    stroke={eq.color}
                    strokeWidth={2}
                    strokeOpacity={0.85}
                    connectNulls={false}
                    dot={(props) => {
                      if (props.value == null) return null;
                      const fuera = props.payload[`_meta_${eq.nombre}`]?.fuera;
                      if (fuera) return <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill="#DC2626" stroke="white" strokeWidth={2} />;
                      const r = esAislado ? 6 : 4;
                      return <circle key={props.index} cx={props.cx} cy={props.cy} r={r} fill={eq.color} stroke="white" strokeWidth={esAislado ? 2 : 1} />;
                    }}
                    activeDot={{ r: 5 }}
                  />
                );
              })}
              {equiposMostrar.flatMap(eq => {
                const lim = limites[eq.id];
                if (!lim) return [];
                return [
                  lim.min != null && <ReferenceLine key={`min-${eq.id}`} y={lim.min} stroke={eq.color} strokeDasharray="4 3" strokeOpacity={0.5} />,
                  lim.max != null && <ReferenceLine key={`max-${eq.id}`} y={lim.max} stroke={eq.color} strokeDasharray="4 3" strokeOpacity={0.5} />,
                ].filter(Boolean);
              })}
            </LineChart>
          </ResponsiveContainer>
        )}

        {equiposDelTipo.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              {filtroTipo === "todos" ? "Todos los equipos" : `Equipos · ${filtroTipo}`}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {equiposDelTipo.map((eq, i) => {
                const r = resumen.find(x => x.id === eq.id);
                const lim = limites[eq.id];
                return (
                  <div key={eq.id} className="bg-[#F8F5F0] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: eq.color || LINE_COLORS[i % LINE_COLORS.length] }} />
                      <p className="text-[11px] font-medium text-[#0A3E47] truncate">{eq.nombre}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">{r?.media != null ? `${r.media}°C` : "—"}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {lim ? `Rango: ${lim.min}° – ${lim.max}°` : "Sin rango"}
                      {r ? ` · ${r.alertas} alertas` : ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista compacta
  return (
    <div
      onClick={onExpand}
      className="relative bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-3 cursor-pointer group hover:shadow-md hover:border-[#6BB68A]/40 transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-[#0A3E47]" />
          <span className="text-xs font-semibold text-[#0A3E47]">Temperatura</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Selector de periodo compacto — detiene el click para no abrir expandido */}
          <select
            value={periodo}
            onChange={e => { e.stopPropagation(); setPeriodo(e.target.value); }}
            onClick={e => e.stopPropagation()}
            className="text-[10px] text-[#0A3E47] font-medium border-0 bg-transparent focus:outline-none cursor-pointer appearance-none pr-1">
            {PERIODOS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[120px]">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
        </div>
      ) : !hayDatos ? (
        <div className="flex items-center justify-center h-[120px]">
          <p className="text-[11px] text-muted-foreground text-center">Sin datos<br />todavía</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {/* Mini gráfico — 60px */}
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              {equipos.map(eq => (
                <Line
                  key={eq.id}
                  type="monotone"
                  dataKey={eq.nombre}
                  stroke={eq.color}
                  strokeWidth={1.5}
                  strokeOpacity={0.85}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          {/* Mini tarjetas de equipos — 60px aprox */}
          <div className="flex gap-1.5 overflow-hidden">
            {equipos.slice(0, 3).map(eq => {
              const r = resumen.find(x => x.id === eq.id);
              return (
                <div key={eq.id} className="flex-1 min-w-0 bg-[#F8F5F0] rounded-lg px-1.5 py-1 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: eq.color }} />
                    <span className="text-[9px] text-[#0A3E47] font-medium truncate">{eq.nombre}</span>
                    {r?.alertas > 0 && (
                      <span className="shrink-0 text-[8px] bg-red-500 text-white rounded px-0.5 font-bold">{r.alertas}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-foreground">
                    {r?.media != null ? `${r.media}°C` : "—"}
                  </span>
                </div>
              );
            })}
            {equipos.length > 3 && (
              <div className="flex items-center justify-center px-1.5 py-1 bg-[#F8F5F0] rounded-lg">
                <span className="text-[9px] text-muted-foreground font-medium">+{equipos.length - 3}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}