import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ClipboardCheck, Maximize2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useBusiness } from "@/contexts/BusinessContext";

function getWeekNumber(date) {
  const d = new Date(date);
  const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  return Math.ceil((d.getDate() + startOfMonth.getDay()) / 7);
}

function isoYYYYMM(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

function daysInMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

const CustomTooltipSemana = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[160px]">
      <p className="font-semibold text-[#0A3E47]">{d.name}</p>
      <p>Score: <span className="font-bold">{d.score}%</span></p>
      <p className="text-muted-foreground">Tareas: {d.tareas}%</p>
      <p className="text-muted-foreground">Registros: {d.registros}%</p>
      <p className="text-muted-foreground">Incidencias: {d.incidencias}%</p>
    </div>
  );
};

export default function GraficoCumplimiento({ expandido, onExpand, onCollapse }) {
  const { user, currentBusiness } = useBusiness();
  const [score, setScore] = useState(0);
  const [semanas, setSemanas] = useState([]);
  const [metricas, setMetricas] = useState({ tareasPorc: 0, diasConRegistros: 0, totalDias: 0, incCerradas: 0, incTotal: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !currentBusiness?.id) return;
    cargar();
  }, [user?.id, currentBusiness?.id]);

  async function cargar() {
    setLoading(true);
    const uid = user.id;
    const bid = currentBusiness.id;
    const ahora = new Date();
    const mesActual = isoYYYYMM(ahora);
    const inicio = startOfMonth().toISOString();
    const fin = endOfMonth().toISOString();
    const totalDias = daysInMonth();

    const [todasEj, todasInc, todosReg] = await Promise.all([
      base44.entities.TareaEjecucion.filter({ user_id: uid, business_id: bid }),
      base44.entities.Incidencia.filter({ user_id: uid, business_id: bid }),
      base44.entities.RegistroTemperatura.filter({ user_id: uid, business_id: bid }),
    ]);

    const ejMes = todasEj.filter(e => e.fecha_dia && e.fecha_dia.startsWith(mesActual));
    const tareasTotal = ejMes.length;
    const tareasComp = ejMes.filter(e => e.completada).length;
    const tareasPorc = tareasTotal > 0 ? Math.round((tareasComp / tareasTotal) * 100) : 0;
    const puntajeA = tareasTotal > 0 ? Math.round((tareasComp / tareasTotal) * 40) : 0;

    const regMes = todosReg.filter(r => r.fecha && r.fecha >= inicio && r.fecha <= fin);
    const diasConReg = new Set(regMes.map(r => r.fecha?.slice(0, 10))).size;
    const puntajeB = Math.round((diasConReg / totalDias) * 30);

    const incMes = todasInc.filter(i => (i.fecha || i.created_date) >= inicio && (i.fecha || i.created_date) <= fin);
    const incCerradas = incMes.filter(i => i.estado === "cerrada").length;
    const incTotal = incMes.length;
    const incAbiertas = todasInc.filter(i => i.estado !== "cerrada").length;
    const puntajeC = incAbiertas === 0 ? 30 : incTotal > 0 ? Math.round((incCerradas / incTotal) * 30) : 30;

    const scoreTotal = Math.min(100, puntajeA + puntajeB + puntajeC);
    setScore(scoreTotal);
    setMetricas({ tareasPorc, diasConRegistros: diasConReg, totalDias, incCerradas, incTotal });

    const semanaMap = {};
    for (let dia = 1; dia <= totalDias; dia++) {
      const sem = Math.ceil((dia + new Date(ahora.getFullYear(), ahora.getMonth(), 1).getDay()) / 7);
      if (!semanaMap[sem]) semanaMap[sem] = { tareas: [], registros: [], dias: 0 };
      semanaMap[sem].dias++;
      const diaISO = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
      const ejDia = ejMes.filter(e => e.fecha_dia === diaISO);
      if (ejDia.length > 0) semanaMap[sem].tareas.push(ejDia.filter(e => e.completada).length / ejDia.length);
      if (regMes.some(r => r.fecha?.slice(0, 10) === diaISO)) semanaMap[sem].registros.push(1);
    }

    const semanasData = Object.entries(semanaMap).map(([s, data]) => {
      const tP = data.tareas.length > 0 ? Math.round((data.tareas.reduce((a,b)=>a+b,0)/data.tareas.length)*40) : 0;
      const rP = Math.round((data.registros.length / data.dias) * 30);
      return {
        name: `Sem ${s}`,
        score: Math.min(100, tP + rP + puntajeC),
        tareas: Math.round((data.tareas.length > 0 ? data.tareas.reduce((a,b)=>a+b,0)/data.tareas.length : 0) * 100),
        registros: Math.round((data.registros.length / data.dias) * 100),
        incidencias: Math.round((puntajeC / 30) * 100),
        esActual: parseInt(s) === getWeekNumber(ahora),
      };
    });
    setSemanas(semanasData);
    setLoading(false);
  }

  const pieData = [
    { value: score ?? 0 },
    { value: 100 - (score ?? 0) },
  ];

  const donutColor = score >= 70 ? "#6BB68A" : score >= 40 ? "#F59E0B" : "#F87171";

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
        </button>
        <h3 className="text-base font-semibold text-[#0A3E47]">Cumplimiento APPCC · Mes actual</h3>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center shrink-0" style={{ width: 200 }}>
            <div className="relative" style={{ width: 200, height: 200 }}>
              <PieChart width={200} height={200}>
                <Pie data={pieData} cx={100} cy={100} innerRadius={65} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                  <Cell fill={donutColor} />
                  <Cell fill="#EDE6DA" />
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingLeft: 6 }}>
                <span className="text-3xl font-bold text-[#0A3E47]">{loading ? "—" : `${score}%`}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">Mes actual</p>
          </div>

          <div className="flex-1 min-w-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={semanas} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltipSemana />} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {semanas.map((s, i) => (
                    <Cell key={i} fill={s.esActual ? "#0A3E47" : "#6BB68A"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: "Tareas completadas", value: `${metricas.tareasPorc}%` },
            { label: "Días con registros", value: `${metricas.diasConRegistros} de ${metricas.totalDias}` },
            { label: "Incidencias gestionadas", value: `${metricas.incCerradas} / ${metricas.incTotal}` },
          ].map((m) => (
            <div key={m.label} className="bg-[#F8F5F0] rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-[#0A3E47]">{m.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onExpand}
      className="relative bg-white rounded-xl border border-[#E8E0D5] shadow-sm p-3 cursor-pointer group hover:shadow-md hover:border-[#6BB68A]/40 transition-all h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <ClipboardCheck className="w-4.5 h-4.5 text-[#0A3E47]" />
          <span className="text-sm font-semibold text-[#0A3E47]">Cumplimiento</span>
        </div>
        <Maximize2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative">
            <PieChart width={160} height={160}>
              <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={70} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                <Cell fill={donutColor} />
                <Cell fill="#EDE6DA" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#0A3E47]">{`${score}%`}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Mes actual</p>
        </div>
      )}
    </div>
  );
}