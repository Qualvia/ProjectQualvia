import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { ClipboardCheck, Maximize2, ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { useDashboardData } from "@/contexts/DashboardDataContext";

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

const PERIODOS_EXP = [
  { value: "mensual",    label: "Mes actual" },
  { value: "trimestral", label: "Trimestre" },
  { value: "semestral",  label: "Semestre" },
  { value: "anual",      label: "Año actual" },
];

export default function GraficoCumplimiento({ expandido, onExpand, onCollapse }) {
  const { data, loading } = useDashboardData();
  const [score, setScore] = useState(0);
  const [semanas, setSemanas] = useState([]);
  const [metricas, setMetricas] = useState({ tareasPorc: 0, diasActivos: 0, totalDias: 0, incCerradas: 0, incTotal: 0 });
  const [onboarding, setOnboarding] = useState(false);
  const [periodoExp, setPeriodoExp] = useState("mensual");
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!data) return;
    calcular();
  }, [data, periodoExp]);

  function calcular() {
    const ahora = new Date();

    // Calcular rango según periodoExp
    let inicioDate, finDate;
    if (periodoExp === "trimestral") {
      inicioDate = new Date(ahora.getFullYear(), ahora.getMonth() - 2, 1);
      finDate = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodoExp === "semestral") {
      inicioDate = new Date(ahora.getFullYear(), ahora.getMonth() - 5, 1);
      finDate = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodoExp === "anual") {
      inicioDate = new Date(ahora.getFullYear(), 0, 1);
      finDate = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59);
    } else {
      inicioDate = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      finDate = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    }
    const inicio = inicioDate.toISOString();
    const fin = finDate.toISOString();
    const inicioISO = inicioDate.toISOString().slice(0, 10);
    const finISO = finDate.toISOString().slice(0, 10);
    const totalDias = Math.round((finDate - inicioDate) / (1000 * 3600 * 24)) + 1;

    const todasEj  = data.ejecuciones;
    const todasInc = data.incidencias;
    const todosTemp  = data.temperaturas;
    const todosLimp  = data.limpiezas;
    const todosAgua  = data.aguas;
    const todosRecep = data.recepciones;
    const todosMant  = data.mantenimientos;
    const todosCong  = data.congelaciones;

    // --- ONBOARDING CHECK ---
    const todosRegistrosGlobal = [...todosTemp, ...todosLimp, ...todosAgua, ...todosRecep, ...todosMant, ...todosCong];
    const diasActivosGlobalSet = new Set([
      ...todasEj.map(e => e.fecha_dia).filter(Boolean),
      ...todosRegistrosGlobal.map(r => r.fecha?.slice(0, 10)).filter(Boolean),
    ]);
    const diasActivosGlobal = diasActivosGlobalSet.size;
    setOnboarding(diasActivosGlobal < 3);

    // --- EJE 1: TAREAS (35pts) ---
    const ejMes = todasEj.filter(e => e.fecha_dia && e.fecha_dia >= inicioISO && e.fecha_dia <= finISO);
    const tareasTotal = ejMes.length;
    const tareasComp = ejMes.filter(e => e.completada).length;
    const tareasPorc = tareasTotal > 0 ? Math.round((tareasComp / tareasTotal) * 100) : 100;
    const puntajeA = tareasTotal > 0 ? (tareasComp / tareasTotal) * 35 : 35;

    // --- EJE 2: REGISTROS (35pts) ---
    const filtrarMes = (arr) => arr.filter(r => r.fecha && r.fecha >= inicio && r.fecha <= fin);
    const tempMes  = filtrarMes(todosTemp);
    const limpMes  = filtrarMes(todosLimp);
    const aguaMes  = filtrarMes(todosAgua);
    const recepMes = filtrarMes(todosRecep);
    const mantMes  = filtrarMes(todosMant);
    const congMes  = filtrarMes(todosCong);

    // Días activos del mes: días con al menos una tarea o un registro
    const diasActivosSet = new Set([
      ...ejMes.map(e => e.fecha_dia).filter(Boolean),
      ...[...tempMes, ...limpMes, ...aguaMes, ...recepMes, ...mantMes, ...congMes].map(r => r.fecha?.slice(0, 10)).filter(Boolean),
    ]);
    const diasActivos = diasActivosSet.size;

    let sumaRegistros = 0;
    diasActivosSet.forEach(dia => {
      const tieneTemp  = tempMes.some(r => r.fecha?.slice(0,10) === dia);
      const tieneLimp  = limpMes.some(r => r.fecha?.slice(0,10) === dia);
      const tieneOtro  = aguaMes.some(r => r.fecha?.slice(0,10) === dia)
                      || recepMes.some(r => r.fecha?.slice(0,10) === dia)
                      || mantMes.some(r => r.fecha?.slice(0,10) === dia)
                      || congMes.some(r => r.fecha?.slice(0,10) === dia);
      if (tieneTemp || tieneLimp) sumaRegistros += 1.0;
      else if (tieneOtro) sumaRegistros += 0.7;
      // else: solo tareas, sin registros → 0.0
    });
    const puntajeB = diasActivos > 0 ? (sumaRegistros / diasActivos) * 35 : 35;

    // --- EJE 3: INCIDENCIAS (30pts) ---
    const incMes = todasInc.filter(i => {
      const f = i.created_date || i.fecha;
      return f && f >= inicio && f <= fin;
    });
    let puntajeC;
    if (incMes.length === 0) {
      puntajeC = 30;
    } else {
      const sumaInc = incMes.reduce((s, i) => {
        if (i.estado === "cerrada") return s + 1.0;
        if (i.estado === "seguimiento") return s + 0.8;
        // abierta
        const horasAbiertas = (ahora - new Date(i.created_date || i.fecha)) / (1000 * 3600);
        return s + (horasAbiertas < 48 ? 0.5 : 0.0);
      }, 0);
      puntajeC = (sumaInc / incMes.length) * 30;
    }
    const incCerradas = incMes.filter(i => i.estado === "cerrada").length;
    const incTotal = incMes.length;

    const scoreTotal = Math.min(100, Math.round(puntajeA + puntajeB + puntajeC));
    setScore(scoreTotal);
    setMetricas({ tareasPorc, diasActivos, totalDias, incCerradas, incTotal });

    // --- SEMANAS ---
    const semanaMap = {};
    const todosRegMes = [...tempMes, ...limpMes, ...aguaMes, ...recepMes, ...mantMes, ...congMes];
    for (let i = 0; i < totalDias; i++) {
      const diaDate = new Date(inicioDate);
      diaDate.setDate(inicioDate.getDate() + i);
      const diaISO = diaDate.toISOString().slice(0, 10);
      const semOffset = Math.floor(i / 7) + 1;
      const sem = semOffset;
      if (!semanaMap[sem]) semanaMap[sem] = { tareas: [], registros: [], dias: 0, label: null, inicioSem: null, finSem: null };
      if (semanaMap[sem].inicioSem === null) semanaMap[sem].inicioSem = diaISO;
      semanaMap[sem].finSem = diaISO;
      semanaMap[sem].dias++;
      if (!semanaMap[sem].label) {
        semanaMap[sem].label = periodoExp === "mensual"
          ? `Sem ${sem}`
          : `${String(diaDate.getDate()).padStart(2,"0")}/${String(diaDate.getMonth()+1).padStart(2,"0")}`;
      }
      const ejDia = ejMes.filter(e => e.fecha_dia === diaISO);
      if (ejDia.length > 0) semanaMap[sem].tareas.push(ejDia.filter(e => e.completada).length / ejDia.length);
      const tieneRegDia = todosRegMes.some(r => r.fecha?.slice(0,10) === diaISO);
      if (tieneRegDia) semanaMap[sem].registros.push(1);
    }

    const hoyISO = ahora.toISOString().slice(0, 10);

    const semanasData = Object.entries(semanaMap).map(([s, data]) => {
      // Semana futura: finSem aún no ha llegado
      if (data.inicioSem > hoyISO) {
        return {
          name: data.label || `Sem ${s}`,
          score: 0,
          tareas: 0,
          registros: 0,
          incidencias: 0,
          esActual: false,
          esFutura: true,
        };
      }

      const esActual = hoyISO >= data.inicioSem && hoyISO <= data.finSem;

      // tP: tareas de la semana
      const ejSem = ejMes.filter(e => e.fecha_dia && e.fecha_dia >= data.inicioSem && e.fecha_dia <= data.finSem);
      const tP = ejSem.length > 0
        ? Math.round((ejSem.filter(e => e.completada).length / ejSem.length) * 35)
        : (esActual ? 35 : 0);

      // rP: días con al menos un registro dentro de la semana
      const diasConRegSem = new Set(
        todosRegMes.filter(r => {
          const d = r.fecha?.slice(0, 10);
          return d && d >= data.inicioSem && d <= data.finSem;
        }).map(r => r.fecha.slice(0, 10))
      ).size;
      const rP = diasConRegSem > 0
        ? Math.round((diasConRegSem / data.dias) * 35)
        : (esActual ? 35 : 0);

      // Calcular puntaje de incidencias para esta semana individualmente
      const incSem = todasInc.filter(i => {
        const f = (i.created_date || i.fecha)?.slice(0, 10);
        return f && f >= data.inicioSem && f <= data.finSem;
      });
      const hayActividad = ejSem.length > 0 || diasConRegSem > 0;
      let puntajeCsem;
      if (incSem.length === 0) {
        puntajeCsem = (esActual || hayActividad) ? 30 : 0;
      } else {
        const sumaIncSem = incSem.reduce((acc, i) => {
          if (i.estado === "cerrada") return acc + 1.0;
          if (i.estado === "seguimiento") return acc + 0.8;
          const horasAbiertas = (ahora - new Date(i.created_date || i.fecha)) / (1000 * 3600);
          return acc + (horasAbiertas < 48 ? 0.5 : 0.0);
        }, 0);
        puntajeCsem = (sumaIncSem / incSem.length) * 30;
      }

      return {
        name: data.label || `Sem ${s}`,
        score: Math.min(100, tP + rP + Math.round(puntajeCsem)),
        tareas: ejSem.length > 0 ? Math.round((ejSem.filter(e => e.completada).length / ejSem.length) * 100) : 100,
        registros: Math.round((diasConRegSem / data.dias) * 100),
        incidencias: Math.round((puntajeCsem / 30) * 100),
        esActual,
      };
    });
    setSemanas(semanasData);
  }

  const pieData = [
    { value: score ?? 0 },
    { value: 100 - (score ?? 0) },
  ];
  const pieDataGris = [{ value: 1 }];

  const donutColor = score >= 70 ? "#6BB68A" : score >= 40 ? "#F59E0B" : "#F87171";

  const OnboardingChips = () => (
    <div className="flex gap-1.5 flex-wrap justify-center mt-2">
      {["Temperatura", "Limpieza", "Tareas"].map(chip => (
        <span key={chip} className="flex items-center gap-1 text-[10px] text-muted-foreground border border-muted-foreground/30 rounded-full px-2 py-0.5">
          <span className="w-3 h-3 rounded-full border border-muted-foreground/40 flex-shrink-0" />
          {chip}
        </span>
      ))}
    </div>
  );

  if (expandido) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <button onClick={onCollapse} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a gráficos
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-[#0A3E47]">Cumplimiento APPCC</h3>
            <div className="relative">
              <button
                onClick={() => setShowInfo(v => !v)}
                className="text-muted-foreground hover:text-[#0A3E47] transition-colors">
                <HelpCircle className="w-4 h-4" />
              </button>
              {showInfo && (
                <div className="absolute left-0 top-6 z-20 bg-white border border-border rounded-xl shadow-lg p-3 text-xs text-muted-foreground w-72 space-y-1">
                  <p className="font-semibold text-[#0A3E47] mb-1">¿Cómo se calcula?</p>
                  <p>Tareas completadas (35%) · Días con registros (35%) · Gestión de incidencias (30%)</p>
                  <p className="mt-1 text-[11px]">Tener incidencias no penaliza — lo que cuenta es resolverlas a tiempo.</p>
                </div>
              )}
            </div>
          </div>
          <div className="relative inline-flex items-center">
            <select
              value={periodoExp}
              onChange={e => setPeriodoExp(e.target.value)}
              className="text-xs text-[#6BB68A] font-medium border border-[#6BB68A]/50 rounded-full pl-3 pr-7 py-1.5 bg-white focus:outline-none cursor-pointer appearance-none">
              {PERIODOS_EXP.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 w-3 h-3 text-[#6BB68A] pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center shrink-0" style={{ width: 200 }}>
            <div className="relative" style={{ width: 200, height: 200 }}>
              {onboarding ? (
                <PieChart width={200} height={200}>
                  <Pie data={pieDataGris} cx={100} cy={100} innerRadius={65} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                    <Cell fill="#D1D5DB" />
                  </Pie>
                </PieChart>
              ) : (
                <PieChart width={200} height={200}>
                  <Pie data={pieData} cx={100} cy={100} innerRadius={65} outerRadius={90} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                    <Cell fill={donutColor} />
                    <Cell fill="#EDE6DA" />
                  </Pie>
                </PieChart>
              )}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingLeft: 6 }}>
                <span className="text-3xl font-bold text-[#0A3E47]">{loading ? "—" : onboarding ? "—" : `${score}%`}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{PERIODOS_EXP.find(p => p.value === periodoExp)?.label}</p>
            {onboarding && (
              <>
                <p className="text-[11px] text-muted-foreground text-center mt-2 leading-tight">Registra los primeros días para ver tu score</p>
                <OnboardingChips />
              </>
            )}
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
                    <Cell key={i} fill={s.esFutura ? "#E5E7EB" : s.esActual ? "#0A3E47" : "#6BB68A"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { label: "Tareas completadas", value: `${metricas.tareasPorc}%` },
            { label: "Días activos", value: `${metricas.diasActivos} de ${metricas.totalDias}` },
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
        <Maximize2 className="w-3 h-3 text-muted-foreground" />
      </div>
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-[#0A3E47] rounded-full animate-spin" />
        </div>
      ) : onboarding ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="relative w-[180px] h-[180px]">
            <PieChart width={180} height={180}>
              <Pie data={pieDataGris} cx={90} cy={90} innerRadius={58} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                <Cell fill="#D1D5DB" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-muted-foreground">—</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center leading-tight px-2">Registra los primeros días para ver tu score</p>
          <OnboardingChips />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="relative w-[180px] h-[180px]">
            <PieChart width={180} height={180}>
              <Pie data={pieData} cx={90} cy={90} innerRadius={58} outerRadius={80} startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}>
                <Cell fill={donutColor} />
                <Cell fill="#EDE6DA" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#0A3E47]">{`${score}%`}</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Mes actual</p>
        </div>
      )}
    </div>
  );
}