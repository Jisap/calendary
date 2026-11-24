import { pgTable, text, integer, doublePrecision, boolean, timestamp, date, uuid, jsonb } from "drizzle-orm/pg-core";

/**
 * Plantillas de horarios semanales o reglas por día.
 * Vinculadas al usuario (auth.users en Supabase) para garantizar aislamiento de datos con RLS.
 */
export const shiftTemplates = pgTable("shift_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(), // Id del usuario de Supabase Auth
  name: text("name").notNull(), // Ej: "Mañana Estándar", "Mañana Corta", "Tarde Flexible"
  type: text("type").notNull(), // "MORNING" | "AFTERNOON" | "NIGHT" | "OTHER"
  defaultStartTime: text("default_start_time"), // "HH:mm" o null
  defaultEndTime: text("default_end_time"), // "HH:mm" o null
  defaultBreakMinutes: integer("default_break_minutes").default(0),
  isFlexible: boolean("is_flexible").default(false),
  applicableDays: jsonb("applicable_days"), // array de números [1, 2, 3] (Lunes = 1, etc.)
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Registro de festivos oficiales.
 * Pueden ser públicos/globales (userId null) o personalizados por el usuario.
 */
export const holidays = pgTable("holidays", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"), // null para festivos nacionales comunes, o user_id si añade locales
  date: date("date").notNull(), // "YYYY-MM-DD"
  name: text("name").notNull(),
  type: text("type").default("NATIONAL"), // NATIONAL, REGIONAL, LOCAL
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Registro diario de jornada de trabajo.
 * Cada fila pertenece a un usuario específico y está protegida por RLS.
 */
export const workEntries = pgTable("work_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(), // Supabase Auth UID

  date: date("date").notNull(), // "YYYY-MM-DD"

  // Clasificación del turno y plantilla asociada
  shiftType: text("shift_type").notNull(), // "MORNING" | "AFTERNOON" | "NIGHT" | "OTHER"
  templateId: uuid("template_id").references(() => shiftTemplates.id, { onDelete: "set null" }),

  // Horario previsto/planificado (opcional para control de desviaciones)
  plannedStart: text("planned_start"), // "HH:mm"
  plannedEnd: text("planned_end"), // "HH:mm"

  // Horario real realizado
  actualStart: text("actual_start").notNull(), // "HH:mm" o ISO timestamp
  actualEnd: text("actual_end").notNull(), // "HH:mm" o ISO timestamp
  breakMinutes: integer("break_minutes").default(0),

  // Horas extras separadas al inicio o al final
  overtimeMinutesBefore: integer("overtime_minutes_before").default(0),
  overtimeMinutesAfter: integer("overtime_minutes_after").default(0),
  overtimeReason: text("overtime_reason"),

  // Banderas de libranzas y festivos
  isRestDay: boolean("is_rest_day").default(false),
  isHoliday: boolean("is_holiday").default(false),
  holidayName: text("holiday_name"),

  // Totales calculados para agregados rápidos
  totalOrdinaryHours: doublePrecision("total_ordinary_hours").default(0.0),
  totalOvertimeHours: doublePrecision("total_overtime_hours").default(0.0),

  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type WorkEntry = typeof workEntries.$inferSelect;
export type NewWorkEntry = typeof workEntries.$inferInsert;
export type ShiftTemplate = typeof shiftTemplates.$inferSelect;
export type Holiday = typeof holidays.$inferSelect;
