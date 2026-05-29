import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Legend,
} from "recharts";
import { Thermometer, Maximize2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

const LINE_COLORS = ["#0A3E47", "#6BB68A", "#D97706", "#9333EA", "#0891B2", "#DC2626", "#65A30D"];

function formatDD_MM(isoStr) {
  const d = new Date(isoStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
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
  const [equipos, setEquipos] = useState([]); // equipos con registros recientes
  const [todosEquipos, setTodosEquipos] = useState([]); // todos los configurados
  const [limites, setLimites] = useState({});
  const [tiposDisponibles, setTiposDisponibles] = useState([]); // tipos únicos configurados
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [resumen, setResumen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;
    cargar();
  }, [user?.id, currentBusiness?.id]);

  async function cargar() {
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;
    const hace7 = new Date();
    hace7.setDate(hace7.getDate() - 7);

    const [registros, eqs] = await Promise.all([
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid }),
      base44.entities.EquipoTemperatura.filter({ user_id: uid, business_id: bid }),
    ]);

    const recientes = registros.filter(r => r.fecha && new Date(r.fecha) >= hace7);
    const dias = getLast7Days();

    const limitesMap = {};
    eqs.forEach(eq => { limitesMap[eq.id] = { nombre: eq.nombre, tipo: eq.tipo || "Otro", min: eq.temp_min, max: eq.temp_max }; });

    // Todos los equipos configurados
    const todosEqs = eqs.map((eq, i) => ({ id: eq.id, nombre: eq.nombre, tipo: eq.tipo || "Otro", color: LINE_COLORS[i % LINE_COLORS.length] }));
    setTodosEquipos(todosEqs);

    // Tipos únicos disponibles
    const tipos = ["todos", ...new Set(eqs.map(eq => eq.tipo || "Otro").filter(Boolean))];
    setTiposDisponibles(tipos);

    // Equipos con registros recientes
    const equiposIds = [...new Set(recientes.map(r => r.equipo_id))];
    setEquipos(equiposIds.map((id, i) => ({ id, nombre: limitesMap[id]?.nombre || id, tipo: limitesMap[id]?.tipo || "Otro", color: LINE_COLORS[i % LINE_COLORS.length] })));
    setLimites(limitesMap);

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
      const media = regsEq.length > 0 ? Math.round((regsEq.reduce((s, r) => s + r.temperatura, 0) / regsEq.length) * 10) / 10 : null;
      const lim = limitesMap[eqId];
      const alertas = regsEq.filter(r => lim && (r.temperatura < lim.min || r.temperatura > lim.max)).length;
      const diasConReg = new Set(regsEq.map(r => r.fecha?.slice(0, 10))).size;
      return { id: eqId, nombre: limitesMap[eqId]?.nombre || eqId, tipo: limitesMap[eqId]?.tipo || "Otro", media, alertas, diasConReg, color: LINE_COLORS[i % LINE_COLORS.length] };
    });
    setResumen(res);
    setLoading(false);
  }

  // Equipos a mostrar en gráfico (filtrados por tipo)
  const equiposMostrar = filtroTipo === "todos" ? equipos : equipos.filter(e => e.tipo === filtroTipo);

  // Equipos configurados del tipo seleccionado (para mostrar debajo)
  const equiposDelTipo = filtroTipo === "todos" ? todosEquipos : todosEquipos.filter(e => e.tipo === filtroTipo);

  const hayDatos = !loading && equipos.length > 0 && data.some(d => equipos.some(eq => d[eq.nombre] != null));

  // Calcular dominio Y dinámico según el tipo seleccionado
  function getYDomain() {
    if (filtroTipo === "todos") return ["auto", "auto"];
    const eqsDelTipo = Object.entries(limites).filter(([, v]) => v.tipo === filtroTipo);
    if (eqsDelTipo.length === 0) return ["auto", "auto"];
    const mins = eqsDelTipo.map(([, v]) => v.min).filter(v => v != null);
    const maxs = eqsDelTipo.map(([, v]) => v.max).filter(v => v != null);
    if (!mins.length || !maxs.length) return ["auto", "auto"];
    const minVal = Math.min(...mins);
    const maxVal = Math.max(...maxs);
    const margen = Math.max(3, Math.abs(maxVal - minVal) * 0.5);
    return [Math.floor(minVal - margen), Math.ceil(maxVal + margen)];
  }

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
          </button>
          <div className="flex gap-1.5 flex-wrap justify-end">
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
        <h3 className="text-base font-semibold text-[#0A3E47]">Temperatura equipos · Últimos 7 días</h3>

        {!hayDatos ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Thermometer className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Sin registros de temperatura esta semana</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}°`} domain={getYDomain()} allowDataOverflow={false} />
              <Tooltip content={<CustomTooltipTemp />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {equiposMostrar.map(eq => (
                <Line key={eq.id} type="monotone" dataKey={eq.nombre} stroke={eq.color} strokeWidth={2}
                  dot={(props) => {
                    const fuera = props.payload[`_meta_${eq.nombre}`]?.fuera;
                    if (fuera) return <circle key={props.index} cx={props.cx} cy={props.cy} r={5} fill="#DC2626" stroke="white" strokeWidth={1.5} />;
                    return <circle key={props.index} cx={props.cx} cy={props.cy} r={3} fill={eq.color} />;
                  }}
                  connectNulls={false} />
              ))}
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

  return (
    <div
      onClick={onExpand}
      className="relative bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-3 cursor-pointer group hover:shadow-md hover:border-[#6BB68A]/40 transition-all">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Thermometer className="w-3.5 h-3.5 text-[#0A3E47]" />
          <span className="text-xs font-semibold text-[#0A3E47]">Temperatura</span>
        </div>
        <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            {equipos.map(eq => (
              <Line key={eq.id} type="monotone" dataKey={eq.nombre} stroke={eq.color} strokeWidth={1.5} dot={false} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}