"use client";

import { useState, useMemo } from "react";
import { type WorkEntry } from "@/db/schema";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  format,
  parseISO,
  subMonths,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getQuarter,
  getYear,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Clock,
  Flame,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface AnalyticsDashboardProps {
  entries: WorkEntry[];
  userEmail: string;
}

type PeriodType = "MONTH" | "QUARTER" | "SEMESTER" | "YEAR";

export function AnalyticsDashboard({ entries, userEmail }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<PeriodType>("QUARTER");
  const now = new Date();

  // Filtrado según el período seleccionado
  const filteredEntries = useMemo(() => {
    let cutoff: Date;
    if (period === "MONTH") {
      cutoff = subMonths(now, 1);
    } else if (period === "QUARTER") {
      cutoff = subMonths(now, 3);
    } else if (period === "SEMESTER") {
      cutoff = subMonths(now, 6);
    } else {
      cutoff = subMonths(now, 12);
    }

    return entries
      .filter((e) => isAfter(parseISO(e.date), cutoff))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, period]);

  // Agrupación mensual para el gráfico de barras y líneas
  const monthlyData = useMemo(() => {
    const map = new Map<
      string,
      { label: string; ordinarias: number; extras: number; total: number; dias: number }
    >();

    filteredEntries.forEach((e) => {
      const d = parseISO(e.date);
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM yyyy", { locale: es });

      const current = map.get(key) || {
        label,
        ordinarias: 0,
        extras: 0,
        total: 0,
        dias: 0,
      };

      current.ordinarias += e.totalOrdinaryHours ?? 0;
      current.extras += e.totalOvertimeHours ?? 0;
      current.total += (e.totalOrdinaryHours ?? 0) + (e.totalOvertimeHours ?? 0);
      current.dias += 1;

      map.set(key, current);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, val]) => ({
        ...val,
        ordinarias: parseFloat(val.ordinarias.toFixed(1)),
        extras: parseFloat(val.extras.toFixed(1)),
        total: parseFloat(val.total.toFixed(1)),
      }));
  }, [filteredEntries]);

  // Distribución de tipos de turno (Pastel / Donut)
  const shiftDistribution = useMemo(() => {
    let morning = 0;
    let afternoon = 0;
    let other = 0;

    filteredEntries.forEach((e) => {
      if (e.shiftType === "MORNING") morning++;
      else if (e.shiftType === "AFTERNOON") afternoon++;
      else other++;
    });

    const total = morning + afternoon + other;
    if (total === 0) return [];

    return [
      { name: "Mañana", value: morning, color: "#3b82f6" },
      { name: "Tarde", value: afternoon, color: "#f59e0b" },
      { name: "Otro", value: other, color: "#a855f7" },
    ].filter((item) => item.value > 0);
  }, [filteredEntries]);

  // Desglose de horas extras: al entrar vs al salir
  const overtimeBreakdown = useMemo(() => {
    let beforeMins = 0;
    let afterMins = 0;

    filteredEntries.forEach((e) => {
      beforeMins += e.overtimeMinutesBefore ?? 0;
      afterMins += e.overtimeMinutesAfter ?? 0;
    });

    return [
      { name: "Previas (Entrada)", value: parseFloat((beforeMins / 60).toFixed(1)), color: "#6366f1" },
      { name: "Posteriores (Salida)", value: parseFloat((afterMins / 60).toFixed(1)), color: "#f97316" },
    ].filter((i) => i.value > 0);
  }, [filteredEntries]);

  // Totales generales del período
  const totals = useMemo(() => {
    let totalOrd = 0;
    let totalExt = 0;
    let restDays = 0;
    let holidays = 0;

    filteredEntries.forEach((e) => {
      totalOrd += e.totalOrdinaryHours ?? 0;
      totalExt += e.totalOvertimeHours ?? 0;
      if (e.isRestDay) restDays++;
      if (e.isHoliday) holidays++;
    });

    return {
      ordinarias: parseFloat(totalOrd.toFixed(1)),
      extras: parseFloat(totalExt.toFixed(1)),
      total: parseFloat((totalOrd + totalExt).toFixed(1)),
      jornadas: filteredEntries.length,
      especiales: restDays + holidays,
      mediaDiaria:
        filteredEntries.length > 0
          ? parseFloat(((totalOrd + totalExt) / filteredEntries.length).toFixed(1))
          : 0,
    };
  }, [filteredEntries]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera con botón de retorno y selector de periodo */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm"
              title="Volver al Calendario"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>Analítica y Gráficos</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  Estadísticas
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evolución de horas ordinarias, extras y turnos para {userEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Selector de Rango Temporal */}
            <div className="flex items-center p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
              <button
                onClick={() => setPeriod("MONTH")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === "MONTH"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Último Mes
              </button>
              <button
                onClick={() => setPeriod("QUARTER")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === "QUARTER"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Trimestre
              </button>
              <button
                onClick={() => setPeriod("SEMESTER")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === "SEMESTER"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Semestre
              </button>
              <button
                onClick={() => setPeriod("YEAR")}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  period === "YEAR"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                1 Año
              </button>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Tarjetas KPI de resumen del período seleccionado */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
              Total Horas
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totals.total}
              </span>
              <span className="text-xs text-slate-500">hrs</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {totals.ordinarias}h ordinarias
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
              Horas Extras
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {totals.extras}
              </span>
              <span className="text-xs text-slate-500">hrs</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {totals.total > 0 ? ((totals.extras / totals.total) * 100).toFixed(1) : 0}% del tiempo total
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
              Jornadas Trabajadas
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {totals.jornadas}
              </span>
              <span className="text-xs text-slate-500">días</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Promedio: {totals.mediaDiaria} h/día
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block">
              Días Especiales
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {totals.especiales}
              </span>
              <span className="text-xs text-slate-500">días</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">Festivos / Descansos</span>
          </div>
        </div>

        {/* Gráfico Principal: Evolución Mensual (Barras agrupadas) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Comparativa de Horas Ordinarias vs Horas Extras
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Agrupado por mes</span>
          </div>

          <div className="h-72 w-full">
            {monthlyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No hay suficientes datos registrados en este período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="ordinarias" name="Horas Ordinarias" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="extras" name="Horas Extras" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fila Inferior: Distribución de Turnos + Horas Extras al Inicio vs Final */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico 1: Proporción de Turnos */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <PieIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribución de Turnos (Mañana vs Tarde)
              </h2>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {shiftDistribution.length === 0 ? (
                <span className="text-xs text-slate-400">Sin datos de turnos</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={shiftDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }: { name?: string; percent?: number }) =>
                        `${name || ""} ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {shiftDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.5rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico 2: Origen de las Horas Extras */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Origen de Horas Extras (Entrada vs Salida)
              </h2>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {overtimeBreakdown.length === 0 ? (
                <div className="text-center">
                  <span className="text-xs text-slate-400 block">No se registraron horas extras</span>
                  <span className="text-[11px] text-slate-500">¡Jornadas dentro del horario previsto!</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overtimeBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, value }) => `${name}: ${value}h`}
                    >
                      {overtimeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.5rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
