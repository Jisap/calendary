"use client";

import { useMemo } from "react";
import { type WorkEntry } from "@/db/schema";
import { exportEntriesToCSV } from "@/lib/export-utils";
import {
  X,
  FileSpreadsheet,
  Printer,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: WorkEntry[];
  currentDate: Date;
  userEmail: string;
}

export function MonthlyReportModal({
  isOpen,
  onClose,
  entries,
  currentDate,
  userEmail,
}: MonthlyReportModalProps) {
  // Filtrar jornadas pertenecientes al mes seleccionado
  const monthEntries = useMemo(() => {
    return entries
      .filter((e) => isSameMonth(parseISO(e.date), currentDate))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, currentDate]);

  // Totales y cálculos del mes
  const totals = useMemo(() => {
    let totalOrdinaryHours = 0;
    let totalOvertimeHours = 0;
    let totalOvertimeBeforeMinutes = 0;
    let totalOvertimeAfterMinutes = 0;
    let totalBreakMinutes = 0;
    let morningCount = 0;
    let afternoonCount = 0;
    let restDaysWorked = 0;
    let holidaysWorked = 0;

    monthEntries.forEach((e) => {
      totalOrdinaryHours += e.totalOrdinaryHours ?? 0;
      totalOvertimeHours += e.totalOvertimeHours ?? 0;
      totalOvertimeBeforeMinutes += e.overtimeMinutesBefore ?? 0;
      totalOvertimeAfterMinutes += e.overtimeMinutesAfter ?? 0;
      totalBreakMinutes += e.breakMinutes ?? 0;
      if (e.shiftType === "MORNING") morningCount++;
      if (e.shiftType === "AFTERNOON") afternoonCount++;
      if (e.isRestDay) restDaysWorked++;
      if (e.isHoliday) holidaysWorked++;
    });

    return {
      daysCount: monthEntries.length,
      totalOrdinaryHours: parseFloat(totalOrdinaryHours.toFixed(2)),
      totalOvertimeHours: parseFloat(totalOvertimeHours.toFixed(2)),
      totalHours: parseFloat((totalOrdinaryHours + totalOvertimeHours).toFixed(2)),
      totalOvertimeBeforeHours: parseFloat((totalOvertimeBeforeMinutes / 60).toFixed(2)),
      totalOvertimeAfterHours: parseFloat((totalOvertimeAfterMinutes / 60).toFixed(2)),
      totalBreakHours: parseFloat((totalBreakMinutes / 60).toFixed(2)),
      morningCount,
      afternoonCount,
      restDaysWorked,
      holidaysWorked,
    };
  }, [monthEntries]);

  if (!isOpen) return null;

  const monthLabel = format(currentDate, "MMMM 'de' yyyy", { locale: es });

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    exportEntriesToCSV(monthEntries, monthLabel);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-backdrop-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden animate-modal-in">
        {/* Cabecera modal (oculta al imprimir) */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white capitalize">
                Informe Mensual: {monthLabel}
              </h2>
              <p className="text-xs text-slate-400">
                Resumen de horas ordinarias, extras y turnos de {userEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
              title="Ver análisis gráfico detallado"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Gráficos</span>
            </Link>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition"
              title="Descargar en formato Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido imprimible y desplazable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs print:p-0 print:text-black print:bg-white">
          {/* Cabecera visible en modo impresión */}
          <div className="hidden print:block pb-4 border-b border-gray-300">
            <h1 className="text-xl font-bold">Calendary - Informe de Jornada Laboral</h1>
            <p className="text-sm text-gray-600 capitalize">
              Mes: {monthLabel} | Empleado: {userEmail}
            </p>
          </div>

          {/* Tarjetas Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block uppercase font-medium">
                Total Horas Mes
              </span>
              <span className="text-xl font-bold text-white print:text-black mt-1 block">
                {totals.totalHours} h
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-500">
                {totals.totalOrdinaryHours} h ordinarias
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block uppercase font-medium">
                Horas Extras
              </span>
              <span className="text-xl font-bold text-amber-400 print:text-black mt-1 block">
                {totals.totalOvertimeHours} h
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-500">
                {totals.totalOvertimeBeforeHours}h inicio / {totals.totalOvertimeAfterHours}h final
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block uppercase font-medium">
                Turnos Trabajados
              </span>
              <span className="text-xl font-bold text-white print:text-black mt-1 block">
                {totals.daysCount} días
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-500">
                {totals.morningCount} mañana / {totals.afternoonCount} tarde
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 print:bg-gray-100 print:border-gray-300">
              <span className="text-[11px] text-slate-400 print:text-gray-600 block uppercase font-medium">
                Especiales
              </span>
              <span className="text-xl font-bold text-purple-300 print:text-black mt-1 block">
                {totals.restDaysWorked + totals.holidaysWorked} días
              </span>
              <span className="text-[10px] text-slate-400 print:text-gray-500">
                {totals.holidaysWorked} festivos / {totals.restDaysWorked} descansos
              </span>
            </div>
          </div>

          {/* Tabla Desglosada día por día */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-200 print:text-black text-sm">
                Desglose Diario Detallado
              </h3>
              <span className="text-slate-400 text-xs">{monthEntries.length} registros</span>
            </div>

            {monthEntries.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/20 border border-slate-800 rounded-xl text-slate-400">
                No hay jornadas registradas en este mes.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800 print:border-gray-300">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-800/70 print:bg-gray-200 border-b border-slate-700 text-slate-300 print:text-black uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-2">Turno</th>
                      <th className="py-2.5 px-2">Horario Real</th>
                      <th className="py-2.5 px-2">Pausa</th>
                      <th className="py-2.5 px-2">Ordinarias</th>
                      <th className="py-2.5 px-2">H. Extras</th>
                      <th className="py-2.5 px-2">Especial</th>
                      <th className="py-2.5 px-3">Observaciones / Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-gray-200 text-slate-300 print:text-black">
                    {monthEntries.map((e) => {
                      const d = parseISO(e.date);
                      const isMorning = e.shiftType === "MORNING";
                      const isAfternoon = e.shiftType === "AFTERNOON";
                      const hasExtra = (e.totalOvertimeHours ?? 0) > 0;

                      return (
                        <tr
                          key={e.id}
                          className="hover:bg-slate-800/40 print:hover:bg-transparent transition"
                        >
                          <td className="py-2 px-3 font-medium text-white print:text-black whitespace-nowrap">
                            {format(d, "dd/MM/yyyy (EEE)", { locale: es })}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                isMorning
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                                  : isAfternoon
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                  : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                              } print:border-none print:bg-transparent print:text-black`}
                            >
                              {isMorning ? "Mañana" : isAfternoon ? "Tarde" : "Otro"}
                            </span>
                          </td>
                          <td className="py-2 px-2 font-mono whitespace-nowrap">
                            {e.actualStart} - {e.actualEnd}
                          </td>
                          <td className="py-2 px-2 font-mono text-slate-400 print:text-gray-600 whitespace-nowrap">
                            {e.breakMinutes}m
                          </td>
                          <td className="py-2 px-2 font-bold font-mono text-indigo-400 print:text-black whitespace-nowrap">
                            {e.totalOrdinaryHours}h
                          </td>
                          <td className="py-2 px-2 font-mono whitespace-nowrap">
                            {hasExtra ? (
                              <span className="text-amber-400 print:text-black font-semibold">
                                +{e.totalOvertimeHours}h{" "}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({e.overtimeMinutesBefore}m / {e.overtimeMinutesAfter}m)
                                </span>
                              </span>
                            ) : (
                              <span className="text-slate-600 print:text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap">
                            {e.isHoliday ? (
                              <span className="text-purple-300 print:text-black font-medium">
                                Festivo {e.holidayName ? `(${e.holidayName})` : ""}
                              </span>
                            ) : e.isRestDay ? (
                              <span className="text-slate-400 print:text-black">Descanso</span>
                            ) : (
                              <span className="text-slate-600 print:text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-400 print:text-gray-600 truncate max-w-[200px]">
                            {e.overtimeReason || e.notes || "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800/90 print:bg-gray-100 font-bold border-t-2 border-slate-700 print:border-gray-400 text-white print:text-black">
                      <td colSpan={4} className="py-2.5 px-3">
                        TOTAL DEL MES
                      </td>
                      <td className="py-2.5 px-2 font-mono text-indigo-400 print:text-black">
                        {totals.totalOrdinaryHours}h
                      </td>
                      <td className="py-2.5 px-2 font-mono text-amber-400 print:text-black">
                        +{totals.totalOvertimeHours}h
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right text-slate-400">
                        {totals.totalHours} Horas Totales
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pie del modal */}
        <div className="p-4 border-t border-slate-800 flex justify-end shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-xs font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
