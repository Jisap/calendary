import { type WorkEntry } from "@/db/schema";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Genera y descarga un archivo CSV compatible con Excel con el detalle mensual.
 */
export function exportEntriesToCSV(entries: WorkEntry[], monthLabel: string) {
  const headers = [
    "Fecha",
    "Día Semana",
    "Turno",
    "Entrada Real",
    "Salida Real",
    "Pausa (min)",
    "H. Ordinarias",
    "Extra Inicio (min)",
    "Extra Salida (min)",
    "H. Extras Total",
    "Descanso Trabajado",
    "Festivo",
    "Motivo Extras / Observaciones",
  ];

  const rows = entries.map((e) => {
    const d = parseISO(e.date);
    const dayOfWeek = format(d, "EEEE", { locale: es });
    const shiftLabel =
      e.shiftType === "MORNING" ? "Mañana" : e.shiftType === "AFTERNOON" ? "Tarde" : "Otro";

    return [
      e.date,
      dayOfWeek,
      shiftLabel,
      e.actualStart,
      e.actualEnd,
      e.breakMinutes ?? 0,
      (e.totalOrdinaryHours ?? 0).toFixed(2),
      e.overtimeMinutesBefore ?? 0,
      e.overtimeMinutesAfter ?? 0,
      (e.totalOvertimeHours ?? 0).toFixed(2),
      e.isRestDay ? "SÍ" : "NO",
      e.isHoliday ? (e.holidayName ? `SÍ (${e.holidayName})` : "SÍ") : "NO",
      `"${(e.overtimeReason || e.notes || "").replace(/"/g, '""')}"`,
    ].join(";");
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n"); // \uFEFF para que Excel reconozca UTF-8 (tildes, etc.)
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `informe_jornadas_${monthLabel.toLowerCase().replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
