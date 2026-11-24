"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { shiftTemplates, type ShiftTemplate } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq } from "drizzle-orm";

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

export interface SaveShiftTemplateInput {
  id?: string;
  name: string;
  type: "MORNING" | "AFTERNOON" | "NIGHT" | "OTHER";
  defaultStartTime: string | null; // "HH:mm" o null si flexible
  defaultEndTime: string | null; // "HH:mm" o null si flexible
  defaultBreakMinutes: number;
  isFlexible: boolean;
  applicableDays: number[]; // [1, 2, 3] (1 = Lunes, 7 = Domingo)
  notes?: string | null;
}

/**
 * Guarda o actualiza una plantilla de turno del usuario.
 */
export async function saveShiftTemplate(input: SaveShiftTemplateInput) {
  const user = await getAuthenticatedUser();

  if (input.id) {
    const [updated] = await db
      .update(shiftTemplates)
      .set({
        name: input.name,
        type: input.type,
        defaultStartTime: input.defaultStartTime,
        defaultEndTime: input.defaultEndTime,
        defaultBreakMinutes: input.defaultBreakMinutes,
        isFlexible: input.isFlexible,
        applicableDays: input.applicableDays,
        notes: input.notes || null,
      })
      .where(and(eq(shiftTemplates.id, input.id), eq(shiftTemplates.userId, user.id)))
      .returning();

    revalidatePath("/");
    return { success: true, template: updated };
  } else {
    const [inserted] = await db
      .insert(shiftTemplates)
      .values({
        userId: user.id,
        name: input.name,
        type: input.type,
        defaultStartTime: input.defaultStartTime,
        defaultEndTime: input.defaultEndTime,
        defaultBreakMinutes: input.defaultBreakMinutes,
        isFlexible: input.isFlexible,
        applicableDays: input.applicableDays,
        notes: input.notes || null,
      })
      .returning();

    revalidatePath("/");
    return { success: true, template: inserted };
  }
}

/**
 * Elimina una plantilla de turno del usuario.
 */
export async function deleteShiftTemplate(id: string) {
  const user = await getAuthenticatedUser();

  await db
    .delete(shiftTemplates)
    .where(and(eq(shiftTemplates.id, id), eq(shiftTemplates.userId, user.id)));

  revalidatePath("/");
  return { success: true };
}
