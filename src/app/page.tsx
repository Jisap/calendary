import { createClient } from "@/lib/supabase/server";
import { getWorkEntriesForRange } from "@/app/actions/work-entries";
import { getUserShiftTemplates, getHolidays } from "@/app/actions/templates";
import { DashboardClient } from "@/components/dashboard-client";
import { LandingPage } from "@/components/landing-page";
import { format, subMonths, addMonths } from "date-fns";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario con sesión activa, renderizamos la Landing Page pública
  if (!user) {
    return <LandingPage />;
  }

  // Rango de fechas para precargar en el Dashboard
  const now = new Date();
  const startDate = format(subMonths(now, 2), "yyyy-MM-01");
  const endDate = format(addMonths(now, 2), "yyyy-MM-28");

  // Carga concurrente de datos del usuario autenticado
  const [entries, templates, holidaysList] = await Promise.all([
    getWorkEntriesForRange(startDate, endDate),
    getUserShiftTemplates(),
    getHolidays(),
  ]);

  return (
    <DashboardClient
      userEmail={user.email || "Usuario"}
      initialEntries={entries}
      templates={templates}
      holidays={holidaysList}
    />
  );
}
