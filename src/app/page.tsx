import { createClient } from "@/lib/supabase/server";
import { getWorkEntriesForRange } from "@/app/actions/work-entries";
import { getUserShiftTemplates, getHolidays } from "@/app/actions/templates";
import { DashboardClient } from "@/components/dashboard-client";
import { format, subMonths, addMonths } from "date-fns";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rango de fechas para precargar (mes anterior, actual y siguiente)
  const now = new Date();
  const startDate = format(subMonths(now, 2), "yyyy-MM-01");
  const endDate = format(addMonths(now, 2), "yyyy-MM-28");

  // Carga concurrente de datos en el servidor
  const [entries, templates, holidaysList] = await Promise.all([
    getWorkEntriesForRange(startDate, endDate),
    getUserShiftTemplates(),
    getHolidays(),
  ]);

  return (
    <DashboardClient
      userEmail={user?.email || "Usuario"}
      initialEntries={entries}
      templates={templates}
      holidays={holidaysList}
    />
  );
}
