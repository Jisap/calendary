"use client";

import { useState, useMemo } from "react";
import { type WorkEntry, type ShiftTemplate } from "@/db/schema";
import { DayModal } from "./day-modal";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
} from "lucide-react";

interface MonthlyCalendarProps {
  initialEntries: WorkEntry[];
  templates: ShiftTemplate[];
  holidays: Array<{ date: string; name: string }>;
  onRefresh: () => Promise<void>;
  currentDate?: Date;
  onMonthChange?: (date: Date) => void;
}

export function MonthlyCalendar({
  initialEntries,
  templates,
  holidays,
  onRefresh,
  currentDate: controlledDate,
  onMonthChange,
}: MonthlyCalendarProps) {
  const [internalDate, setInternalDate] = useState(new Date());
  const currentDate = controlledDate || internalDate;

  function setCurrentDate(date: Date) {
    if (onMonthChange) {
      onMonthChange(date);
    } else {
      setInternalDate(date);
    }
  }

  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mapa rápido de fecha -> festivo
  const holidaysMap = useMemo(() => {
    const map = new Map<string, string>();
    holidays.forEach((h) => map.set(h.date, h.name));
    return map;
  }, [holidays]);

  // Mapa rápido de fecha -> jornada
  const entriesMap = useMemo(() => {
    const map = new Map<string, WorkEntry>();
    initialEntries.forEach((e) => map.set(e.date, e));
    return map;
  }, [initialEntries]);

  // Días a pintar en la cuadrícula (con semanas completas de Lunes a Domingo)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Semana empieza en Lunes
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  // Métricas mensuales acumuladas
  const monthlyStats = useMemo(() => {
    let totalOrdinaryHours = 0;
    let totalOvertimeHours = 0;
    let daysWorked = 0;
    let restDaysWorked = 0;
    let holidaysWorked = 0;

    initialEntries.forEach((entry) => {
      const entryDate = parseISO(entry.date);
      if (isSameMonth(entryDate, currentDate)) {
        daysWorked++;
        totalOrdinaryHours += entry.totalOrdinaryHours ?? 0;
        totalOvertimeHours += entry.totalOvertimeHours ?? 0;
        if (entry.isRestDay) restDaysWorked++;
        if (entry.isHoliday) holidaysWorked++;
      }
    });

    return {
      totalOrdinaryHours: parseFloat(totalOrdinaryHours.toFixed(1)),
      totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(1)),
      totalHours: parseFloat((totalOrdinaryHours + totalOvertimeHours).toFixed(1)),
      daysWorked,
      restDaysWorked,
      holidaysWorked,
    };
  }, [initialEntries, currentDate]);

  function handleDayClick(dateStr: string) {
    setSelectedDateStr(dateStr);
    setIsModalOpen(true);
  }

  const selectedEntry = selectedDateStr ? entriesMap.get(selectedDateStr) || null : null;
  const selectedHolidayName = selectedDateStr ? holidaysMap.get(selectedDateStr) || null : null;

  return (
    <div className="space-y-6">
      {/* Tarjetas de Métricas Mensuales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Total Horas
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{monthlyStats.totalHours}</span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {monthlyStats.totalOrdinaryHours} h ordinarias
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Horas Extras
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-amber-400">{monthlyStats.totalOvertimeHours}</span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Acumuladas este mes</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Jornadas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{monthlyStats.daysWorked}</span>
            <span className="text-xs text-slate-400">días</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Trabajados en el mes</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Especiales
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-purple-300">
              {monthlyStats.restDaysWorked + monthlyStats.holidaysWorked}
            </span>
            <span className="text-xs text-slate-400">días</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {monthlyStats.holidaysWorked} festivos / {monthlyStats.restDaysWorked} descansos
          </span>
        </div>
      </div>

      {/* Cabecera del Calendario: Navegación de Mes y Leyenda */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold capitalize text-white tracking-tight">
              {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              Hoy
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leyenda amigable de colores */}
        <div className="flex flex-wrap items-center gap-4 pt-3 pb-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Mañana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Tarde</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
            <span>Festivo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 ring-2 ring-amber-400/30 inline-block" />
            <span>Horas Extras</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" />
            <span>Día Descanso</span>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span className="text-slate-500">Sáb</span>
          <span className="text-slate-500">Dom</span>
        </div>

        {/* Cuadrícula de Días */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const entry = entriesMap.get(dateStr);
            const holiday = holidaysMap.get(dateStr);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            // Determinar estilo del turno
            const isMorning = entry?.shiftType === "MORNING";
            const isAfternoon = entry?.shiftType === "AFTERNOON";
            const hasOvertime = (entry?.totalOvertimeHours ?? 0) > 0;

            return (
              <button
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                className={`min-h-[75px] sm:min-h-[92px] p-2 rounded-xl text-left border flex flex-col justify-between transition group relative ${
                  !isCurrentMonth
                    ? "opacity-30 border-transparent bg-slate-900/30 hover:opacity-60"
                    : "bg-slate-800/40 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700"
                } ${isTodayDate ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950" : ""}`}
              >
                {/* Cabecera del día */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isTodayDate
                        ? "text-indigo-400"
                        : isCurrentMonth
                        ? "text-slate-200"
                        : "text-slate-500"
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Indicador de horas extras (punto luminoso) */}
                  {hasOvertime && (
                    <span
                      title={`+${entry?.totalOvertimeHours}h extras`}
                      className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50"
                    />
                  )}
                </div>

                {/* Contenido del día: Turno o festivo */}
                <div className="w-full space-y-1 my-auto">
                  {holiday && (
                    <div
                      title={holiday}
                      className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 font-medium truncate border border-purple-500/25"
                    >
                      {holiday}
                    </div>
                  )}

                  {entry ? (
                    <div
                      className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded font-medium flex items-center justify-between border truncate ${
                        isMorning
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          : isAfternoon
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                      }`}
                    >
                      <span className="truncate font-mono">
                        {entry.actualStart}-{entry.actualEnd}
                      </span>
                    </div>
                  ) : isCurrentMonth ? (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center text-slate-500 py-1 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  ) : null}
                </div>

                {/* Pie del día: Total de horas si hay registro */}
                {entry && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{entry.totalOrdinaryHours}h</span>
                    {hasOvertime && (
                      <span className="text-amber-400 font-semibold">
                        +{entry.totalOvertimeHours}h
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalle / Registro */}
      {selectedDateStr && (
        <DayModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          dateStr={selectedDateStr}
          entry={selectedEntry}
          templates={templates}
          holidayName={selectedHolidayName}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
