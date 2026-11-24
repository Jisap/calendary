"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workEntries, shiftTemplates, holidays, type WorkEntry, type NewWorkEntry } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { calculateWorkHours } from "@/lib/time-calculations";
import { and, eq, gte, lte, asc } from "drizzle-orm";

/**
 * Obtiene el usuario autenticado actual o lanza un error si no hay sesión.
 */
async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("No autenticado. Por favor inicia sesión.");
  }
  return user;
}

/**
 * Obtiene todas las jornadas del usuario para un rango de fechas (ej. un mes completo).
 * Formato de fechas: "YYYY-MM-DD"
 */
export async function getWorkEntriesForRange(startDate: string, endDate: string) {
  const user = await getAuthenticatedUser();

  const entries = await db
    .select()
    .from(workEntries)
    .where(
      and(
        eq(workEntries.userId, user.id),
        gte(workEntries.date, startDate),
        lte(workEntries.date, endDate)
      )
    )
    .orderBy(asc(workEntries.date));

  return entries;
}

/**
 * Obtiene el registro de una fecha específica para el usuario.
 */
export async function getWorkEntryByDate(date: string) {
  const user = await getAuthenticatedUser();

  const [entry] = await db
    .select()
    .from(workEntries)
    .where(and(eq(workEntries.userId, user.id), eq(workEntries.date, date)));

  return entry || null;
}

export interface SaveWorkEntryInput {
  id?: string;
  date: string; // "YYYY-MM-DD"
  shiftType: "MORNING" | "AFTERNOON" | "NIGHT" | "OTHER";
  templateId?: string | null;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  actualStart: string; // "HH:mm"
  actualEnd: string; // "HH:mm"
  breakMinutes?: number;
  overtimeMinutesBefore?: number;
  overtimeMinutesAfter?: number;
  overtimeReason?: string | null;
  isRestDay?: boolean;
  isHoliday?: boolean;
  holidayName?: string | null;
  notes?: string | null;
}

/**
 * Crea o actualiza un registro de jornada, calculando automáticamente horas netas y extras.
 */
export async function saveWorkEntry(input: SaveWorkEntryInput) {
  const user = await getAuthenticatedUser();

  // Calcular horas ordinarias y extras usando nuestra utilidad probada
  const calc = calculateWorkHours({
    date: input.date,
    actualStart: input.actualStart,
    actualEnd: input.actualEnd,
    breakMinutes: input.breakMinutes || 0,
    plannedStart: input.plannedStart || undefined,
    plannedEnd: input.plannedEnd || undefined,
    manualOvertimeMinutesBefore: input.overtimeMinutesBefore,
    manualOvertimeMinutesAfter: input.overtimeMinutesAfter,
  });

  const now = new Date();

  if (input.id) {
    // Actualizar registro existente
    const [updated] = await db
      .update(workEntries)
      .set({
        shiftType: input.shiftType,
        templateId: input.templateId || null,
        plannedStart: input.plannedStart || null,
        plannedEnd: input.plannedEnd || null,
        actualStart: input.actualStart,
        actualEnd: input.actualEnd,
        breakMinutes: input.breakMinutes || 0,
        overtimeMinutesBefore: calc.overtimeMinutesBefore,
        overtimeMinutesAfter: calc.overtimeMinutesAfter,
        overtimeReason: input.overtimeReason || null,
        isRestDay: input.isRestDay ?? false,
        isHoliday: input.isHoliday ?? false,
        holidayName: input.holidayName || null,
        totalOrdinaryHours: calc.ordinaryHours,
        totalOvertimeHours: calc.overtimeHours,
        notes: input.notes || null,
        updatedAt: now,
      })
      .where(and(eq(workEntries.id, input.id), eq(workEntries.userId, user.id)))
      .returning();

    revalidatePath("/");
    return { success: true, entry: updated };
  } else {
    // Verificar si ya existe una entrada para esta fecha
    const existing = await getWorkEntryByDate(input.date);
    if (existing) {
      // Si ya existe, actualizamos para evitar duplicar el mismo día
      return saveWorkEntry({ ...input, id: existing.id });
    }

    // Insertar nuevo registro
    const [inserted] = await db
      .insert(workEntries)
      .values({
        userId: user.id,
        date: input.date,
        shiftType: input.shiftType,
        templateId: input.templateId || null,
        plannedStart: input.plannedStart || null,
        plannedEnd: input.plannedEnd || null,
        actualStart: input.actualStart,
        actualEnd: input.actualEnd,
        breakMinutes: input.breakMinutes || 0,
        overtimeMinutesBefore: calc.overtimeMinutesBefore,
        overtimeMinutesAfter: calc.overtimeMinutesAfter,
        overtimeReason: input.overtimeReason || null,
        isRestDay: input.isRestDay ?? false,
        isHoliday: input.isHoliday ?? false,
        holidayName: input.holidayName || null,
        totalOrdinaryHours: calc.ordinaryHours,
        totalOvertimeHours: calc.overtimeHours,
        notes: input.notes || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    revalidatePath("/");
    return { success: true, entry: inserted };
  }
}

/**
 * Elimina una jornada registrada.
 */
export async function deleteWorkEntry(id: string) {
  const user = await getAuthenticatedUser();

  await db
    .delete(workEntries)
    .where(and(eq(workEntries.id, id), eq(workEntries.userId, user.id)));

  revalidatePath("/");
  return { success: true };
}
