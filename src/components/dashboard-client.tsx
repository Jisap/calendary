"use client";

import { useState } from "react";
import { type WorkEntry, type ShiftTemplate } from "@/db/schema";
import { MonthlyCalendar } from "@/components/calendar/monthly-calendar";
import { getWorkEntriesForRange } from "@/app/actions/work-entries";
import { logout } from "@/app/login/actions";
import { Clock, LogOut, User } from "lucide-react";
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
  templates,
  holidays,
}: DashboardClientProps) {
  const [entries, setEntries] = useState<WorkEntry[]>(initialEntries);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabecera amigable */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Calendary</h1>
              <p className="text-xs text-slate-400">Control de jornada, turnos y horas extras</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[180px] sm:max-w-none">{userEmail}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 transition font-medium"
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
        />
      </div>
    </div>
  );
}
