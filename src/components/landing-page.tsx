"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Clock,
  Calendar,
  Flame,
  ShieldCheck,
  FileSpreadsheet,
  BarChart3,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Barra de Navegación */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              Calendary
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider block -mt-1">
              Jornadas & Horarios
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition"
          >
            <span>Iniciar Sesión</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Control inteligente de turnos flexibles y horas extras</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Tu jornada laboral bajo control.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500">
            Sin complicaciones.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Diseñado para profesionales con horarios que cambian: turnos de mañana con horarios
          diferenciados, tardes flexibles, horas extras separadas al inicio o salida, festivos y
          descansos trabajados.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition"
          >
            <span>Comenzar Ahora Gratis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#caracteristicas"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm transition shadow-sm"
          >
            Ver Características
          </a>
        </div>

        {/* Mockup / Previsualización visual de la app */}
        <div className="mt-14 relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-3 sm:p-5 shadow-2xl backdrop-blur-md max-w-4xl mx-auto">
          <div className="rounded-xl bg-slate-950 p-4 sm:p-6 text-left border border-slate-800 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs text-slate-400 font-mono ml-2">Calendary Dashboard</span>
              </div>
              <span className="text-[11px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                172.5h este mes (+14.5h extras)
              </span>
            </div>

            {/* Fila de días simulados */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Lunes 16</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="mt-2 text-blue-300 font-bold">07:00 - 15:00</div>
                <span className="text-[10px] text-slate-500 block">Mañana Estándar</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Jueves 19</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div className="mt-2 text-blue-300 font-bold">08:00 - 14:30</div>
                <span className="text-[10px] text-slate-500 block">Mañana Especial</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 relative">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Viernes 20</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-400/80" />
                </div>
                <div className="mt-2 text-amber-300 font-bold">14:15 - 22:45</div>
                <span className="text-[10px] text-amber-400 font-semibold block">+1.5h extras</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Sábado 21</span>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                </div>
                <div className="mt-2 text-purple-300 font-bold">Descanso Trab.</div>
                <span className="text-[10px] text-slate-500 block">Día Especial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características Clave */}
      <section id="caracteristicas" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Diseñado para la realidad del día a día
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Una solución hecha a medida para turnos rotativos, convenios y horarios dinámicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Turnos Mañana y Tarde Dinámicos
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Configura horarios fijos para ciertos días de la semana y diferentes para otros. La
              tarde flexible te permite registrar entradas y salidas variables sin fricción.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Horas Extras al Inicio o Salida
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calcula y desglosa si las horas extras fueron por entrar antes a un relevo o por salir
              después, guardando la causa o justificación ante recursos humanos.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Festivos y Días de Descanso
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detección automática de festivos nacionales oficiales y registro sencillo de jornadas
              cubiertas en días de libranza habitual.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Analítica y Gráficos Visuales
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Visualiza en gráficos interactivos tu evolución por mes, trimestre, semestre o año,
              comparando horas ordinarias frente a horas extraordinarias.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Exportación Excel y PDF
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Descarga informes mensuales detallados en formato CSV/Excel en un clic o imprime
              directamente informes oficiales preparados para PDF.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
              Seguridad Supabase RLS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Base de datos PostgreSQL aislada con Row Level Security (RLS). Tus jornadas, plantillas
              y cálculos son 100% privados y seguros.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Calendary. Control de jornadas laborales y horarios.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline text-indigo-600 dark:text-indigo-400">
              Acceder a mi cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
