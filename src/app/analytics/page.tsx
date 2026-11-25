import { createClient } from "@/lib/supabase/server";
import { getWorkEntriesForRange } from "@/app/actions/work-entries";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { format, subMonths } from "date-fns";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Precargar jornadas de los últimos 12 meses para dar soporte a filtros de Mes, Trimestre, Semestre y Año
  const now = new Date();
  const startDate = format(subMonths(now, 12), "yyyy-MM-01");
  const endDate = format(now, "yyyy-MM-dd");

  const entries = await getWorkEntriesForRange(startDate, endDate);

  return <AnalyticsDashboard entries={entries} userEmail={user?.email || "Usuario"} />;
}
