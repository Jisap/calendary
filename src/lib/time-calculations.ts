import { differenceInMinutes, parse, format } from "date-fns";

export interface CalculateWorkHoursParams {
  date: string; // "YYYY-MM-DD"
  actualStart: string; // "HH:mm"
  actualEnd: string; // "HH:mm"
  breakMinutes?: number;
  plannedStart?: string; // "HH:mm"
  plannedEnd?: string; // "HH:mm"
  manualOvertimeMinutesBefore?: number;
  manualOvertimeMinutesAfter?: number;
}

export interface WorkHoursCalculationResult {
  totalGrossMinutes: number;
  netWorkedMinutes: number;
  overtimeMinutesBefore: number;
  overtimeMinutesAfter: number;
  totalOvertimeMinutes: number;
  ordinaryMinutes: number;
  ordinaryHours: number;
  overtimeHours: number;
}

/**
 * Calcula las horas efectivas, pausas y desglose de horas extras previas y posteriores.
 * Maneja tanto jornadas ordinarias como turnos que pasan de la medianoche.
 */
export function calculateWorkHours(params: CalculateWorkHoursParams): WorkHoursCalculationResult {
  const {
    date,
    actualStart,
    actualEnd,
    breakMinutes = 0,
    plannedStart,
    plannedEnd,
    manualOvertimeMinutesBefore,
    manualOvertimeMinutesAfter,
  } = params;

  const baseDate = parse(date, "yyyy-MM-dd", new Date());
  
  let startDate = parse(actualStart, "HH:mm", baseDate);
  let endDate = parse(actualEnd, "HH:mm", baseDate);

  // Si la hora de salida es anterior a la de entrada, el turno cruzó medianoche (día siguiente)
  if (endDate < startDate) {
    endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const totalGrossMinutes = differenceInMinutes(endDate, startDate);
  const netWorkedMinutes = Math.max(0, totalGrossMinutes - breakMinutes);

  let overtimeBefore = manualOvertimeMinutesBefore ?? 0;
  let overtimeAfter = manualOvertimeMinutesAfter ?? 0;

  // Si no se indicaron manualmente pero existen horarios previstos:
  if (plannedStart && manualOvertimeMinutesBefore === undefined) {
    const plannedStartDate = parse(plannedStart, "HH:mm", baseDate);
    if (startDate < plannedStartDate) {
      overtimeBefore = differenceInMinutes(plannedStartDate, startDate);
    }
  }

  if (plannedEnd && manualOvertimeMinutesAfter === undefined) {
    let plannedEndDate = parse(plannedEnd, "HH:mm", baseDate);
    if (plannedEndDate < parse(plannedStart || actualStart, "HH:mm", baseDate)) {
      plannedEndDate = new Date(plannedEndDate.getTime() + 24 * 60 * 60 * 1000);
    }
    if (endDate > plannedEndDate) {
      overtimeAfter = differenceInMinutes(endDate, plannedEndDate);
    }
  }

  const totalOvertimeMinutes = overtimeBefore + overtimeAfter;
  const ordinaryMinutes = Math.max(0, netWorkedMinutes - totalOvertimeMinutes);

  return {
    totalGrossMinutes,
    netWorkedMinutes,
    overtimeMinutesBefore: overtimeBefore,
    overtimeMinutesAfter: overtimeAfter,
    totalOvertimeMinutes,
    ordinaryMinutes,
    ordinaryHours: parseFloat((ordinaryMinutes / 60).toFixed(2)),
    overtimeHours: parseFloat((totalOvertimeMinutes / 60).toFixed(2)),
  };
}

/**
 * Plantillas por defecto para turnos de mañana (con 2 días diferenciados) y tarde
 */
export const DEFAULT_SHIFT_TEMPLATES = [
  {
    id: "morning_standard",
    name: "Mañana Estándar (Lun, Mar, Mié)",
    type: "MORNING" as const,
    defaultStartTime: "07:00",
    defaultEndTime: "15:00",
    defaultBreakMinutes: 30,
    isFlexible: false,
    applicableDays: JSON.stringify([1, 2, 3]), // Lunes, Martes, Miércoles
  },
  {
    id: "morning_special",
    name: "Mañana Horario Reducido / Especial (Jue, Vie)",
    type: "MORNING" as const,
    defaultStartTime: "08:00",
    defaultEndTime: "14:30",
    defaultBreakMinutes: 20,
    isFlexible: true,
    applicableDays: JSON.stringify([4, 5]), // Jueves, Viernes
  },
  {
    id: "afternoon_flexible",
    name: "Tarde Flexible",
    type: "AFTERNOON" as const,
    defaultStartTime: null, // Flexible: sin hora fija
    defaultEndTime: null,
    defaultBreakMinutes: 30,
    isFlexible: true,
    applicableDays: JSON.stringify([1, 2, 3, 4, 5]),
  },
];
