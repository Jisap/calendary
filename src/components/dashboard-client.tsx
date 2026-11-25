"use client";

import { useState } from "react";
import { type WorkEntry, type ShiftTemplate } from "@/db/schema";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { TemplatesModal } from "@/components/templates/templates-modal";
import { MonthlyReportModal } from "@/components/reports/monthly-report-modal";
import { getWorkEntriesForRange } from "@/app/actions/work-entries";
import { getUserShiftTemplates } from "@/app/actions/templates";
import { logout } from "@/app/login/actions";
import { Clock, LogOut, User, SlidersHorizontal, FileText, BarChart2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { format, subMonths, addMonths } from "date-fns";

interface DashboardClientProps {
  userEmail: string;
  initialEntries: WorkEntry[];
  templates: ShiftTemplate[];
  holidays: Array<{ date: string; name: string }>;
}

export function DashboardClient({
  userEmail,
  initialEntries,
  templates: initialTemplates,
  holidays,
}: DashboardClientProps) {
  const [entries, setEntries] = useState<WorkEntry[]>(initialEntries);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(initialTemplates);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Recargar las jornadas (ej. tras guardar o eliminar una)
  async function refreshEntries() {
    const today = new Date();
    const start = format(subMonths(today, 2), "yyyy-MM-01");
    const end = format(addMonths(today, 2), "yyyy-MM-28");
    try {
      const updated = await getWorkEntriesForRange(start, end);
      setEntries(updated);
    } catch (err) {
      console.error("Error refreshing entries:", err);
    }
  }

  // Recargar plantillas tras modificarlas o crearlas
  async function refreshTemplates() {
    try {
      const updated = await getUserShiftTemplates();
      setTemplates(updated);
    } catch (err) {
      console.error("Error refreshing templates:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 md:p-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera amigable con acceso a informes, plantillas y perfil */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Calendary</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control de jornada, turnos y horas extras</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Toggle de tema Claro / Oscuro / Sistema */}
            <ThemeToggle />

            {/* Enlace directo a Analítica y Gráficos */}
            <Link
              href="/analytics"
              className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/20 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-3.5 py-2 rounded-xl transition font-medium shadow-sm"
              title="Ver evolución en gráficos (mes, trimestre, semestre)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Gráficos</span>
            </Link>

            {/* Botón de Informes y Resumen */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/30 bg-indigo-50/80 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 px-3.5 py-2 rounded-xl transition font-medium shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Informe</span>
            </button>

            {/* Botón de configuración de plantillas */}
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl transition font-medium shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Plantillas</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl shadow-sm">
              <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="truncate max-w-[140px] sm:max-w-none">{userEmail}</span>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 bg-rose-50/60 dark:bg-rose-500/10 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-500/20 transition font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </header>

        {/* Componente interactivo del Calendario */}
        <MonthlyCalendar
          initialEntries={entries}
          templates={templates}
          holidays={holidays}
          onRefresh={refreshEntries}
          currentDate={currentDate}
          onMonthChange={setCurrentDate}
        />

        {/* Modal de Configuración de Plantillas */}
        <TemplatesModal
          isOpen={isTemplatesModalOpen}
          onClose={() => setIsTemplatesModalOpen(false)}
          templates={templates}
          onSaved={refreshTemplates}
        />

        {/* Modal de Informe y Resumen Mensual */}
        <MonthlyReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          entries={entries}
          currentDate={currentDate}
          userEmail={userEmail}
        />
      </div>
    </div>
  );
}
