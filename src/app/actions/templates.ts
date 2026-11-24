"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { shiftTemplates, holidays, type ShiftTemplate } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SHIFT_TEMPLATES } from "@/lib/time-calculations";
import { NATIONAL_HOLIDAYS_ES } from "@/lib/holidays";
import { eq, or, isNull } from "drizzle-orm";

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
 * Obtiene las plantillas de turnos del usuario.
 * Si el usuario no tiene ninguna aún, inicializa automáticamente las plantillas por defecto:
 * - Mañana Estándar (Lun, Mar, Mié)
 * - Mañana Diferenciada / Especial (Jue, Vie)
 * - Tarde Flexible
 */
export async function getUserShiftTemplates(): Promise<ShiftTemplate[]> {
  const user = await getAuthenticatedUser();

  const userTemplates = await db
    .select()
    .from(shiftTemplates)
    .where(eq(shiftTemplates.userId, user.id));

  if (userTemplates.length > 0) {
    return userTemplates;
  }

  // Inicialización automática de plantillas por defecto para el usuario
  const toInsert = DEFAULT_SHIFT_TEMPLATES.map((tpl) => ({
    userId: user.id,
    name: tpl.name,
    type: tpl.type,
    defaultStartTime: tpl.defaultStartTime,
    defaultEndTime: tpl.defaultEndTime,
    defaultBreakMinutes: tpl.defaultBreakMinutes,
    isFlexible: tpl.isFlexible,
    applicableDays: JSON.parse(tpl.applicableDays),
  }));

  const inserted = await db.insert(shiftTemplates).values(toInsert).returning();
  return inserted;
}

/**
 * Obtiene los festivos disponibles (públicos nacionales + los que el usuario haya agregado).
 */
export async function getHolidays() {
  const user = await getAuthenticatedUser();

  const userHolidays = await db
    .select()
    .from(holidays)
    .where(or(isNull(holidays.userId), eq(holidays.userId, user.id)));

  // Si no hay ninguno en BD aún, usamos la lista de referencia nacional
  if (userHolidays.length === 0) {
    return NATIONAL_HOLIDAYS_ES.map((h) => ({
      id: h.date,
      date: h.date,
      name: h.name,
      type: "NATIONAL" as const,
      userId: null,
      createdAt: new Date(),
    }));
  }

  return userHolidays;
}
