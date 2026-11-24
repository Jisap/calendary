import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { Clock, Calendar, PlusCircle, LogOut } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Barra superior de usuario */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Calendary</h1>
              <p className="text-xs text-slate-400">Control de Horarios y Jornada</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              {user?.email}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/20 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </header>

        {/* Tarjeta de bienvenida y estado */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur">
          <h2 className="text-lg font-semibold mb-2">¡Todo preparado para mañana!</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-2xl">
            La autenticación con Supabase Auth y la base de datos PostgreSQL con políticas RLS ya están completamente operativas. Mañana continuaremos con la construcción del calendario mensual y el formulario de registro de turnos y horas extras.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Calendar className="w-5 h-5 text-indigo-400 mb-2" />
              <h3 className="text-sm font-medium">Turnos Variables</h3>
              <p className="text-xs text-slate-400 mt-1">
                Mañanas diferenciadas por días y tardes flexibles.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <Clock className="w-5 h-5 text-amber-400 mb-2" />
              <h3 className="text-sm font-medium">Horas Extras</h3>
              <p className="text-xs text-slate-400 mt-1">
                Desglose automático al inicio o final de la jornada.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <PlusCircle className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-sm font-medium">Descansos y Festivos</h3>
              <p className="text-xs text-slate-400 mt-1">
                Cálculo de jornadas en festivos nacionales o descansos trabajados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
