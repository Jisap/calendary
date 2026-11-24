/**
 * Lista de festivos nacionales de España de ejemplo.
 * En la app se puede sincronizar o alimentar dinámicamente.
 */
export const NATIONAL_HOLIDAYS_ES = [
  { date: "2026-01-01", name: "Año Nuevo" },
  { date: "2026-01-06", name: "Epifanía del Señor (Reyes)" },
  { date: "2026-04-03", name: "Viernes Santo" },
  { date: "2026-05-01", name: "Fiesta del Trabajo" },
  { date: "2026-08-15", name: "Asunción de la Virgen" },
  { date: "2026-10-12", name: "Fiesta Nacional de España" },
  { date: "2026-11-01", name: "Todos los Santos" },
  { date: "2026-12-06", name: "Día de la Constitución" },
  { date: "2026-12-08", name: "Inmaculada Concepción" },
  { date: "2026-12-25", name: "Natividad del Señor" },
];

export function getHolidayForDate(dateString: string) {
  return NATIONAL_HOLIDAYS_ES.find((h) => h.date === dateString) || null;
}
