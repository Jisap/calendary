"use client";

import { useState, useEffect } from "react";
import { type WorkEntry, type ShiftTemplate } from "@/db/schema";
import { saveWorkEntry, deleteWorkEntry } from "@/app/actions/work-entries";
import { calculateWorkHours } from "@/lib/time-calculations";
import { enqueueOfflineEntry } from "@/lib/offline-sync";
import { X, Clock, Trash2, Check, AlertCircle, Sparkles, WifiOff } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // "YYYY-MM-DD"
  entry: WorkEntry | null;
  templates: ShiftTemplate[];
  holidayName?: string | null;
  onSaved: () => void;
}

export function DayModal({
  isOpen,
  onClose,
  dateStr,
  entry,
  templates,
  holidayName,
  onSaved,
}: DayModalProps) {
  const [shiftType, setShiftType] = useState<"MORNING" | "AFTERNOON" | "NIGHT" | "OTHER">("MORNING");
  const [templateId, setTemplateId] = useState<string>("");
  const [actualStart, setActualStart] = useState("07:00");
  const [actualEnd, setActualEnd] = useState("15:00");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [plannedStart, setPlannedStart] = useState("07:00");
  const [plannedEnd, setPlannedEnd] = useState("15:00");
  const [overtimeBefore, setOvertimeBefore] = useState(0);
  const [overtimeAfter, setOvertimeAfter] = useState(0);
  const [overtimeReason, setOvertimeReason] = useState("");
  const [isRestDay, setIsRestDay] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar o sincronizar el estado cada vez que se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setError(null);

    if (entry) {
      setShiftType(entry.shiftType as any);
      setTemplateId(entry.templateId || "");
      setActualStart(entry.actualStart || "07:00");
      setActualEnd(entry.actualEnd || "15:00");
      setBreakMinutes(entry.breakMinutes ?? 0);
      setPlannedStart(entry.plannedStart || "");
      setPlannedEnd(entry.plannedEnd || "");
      setOvertimeBefore(entry.overtimeMinutesBefore ?? 0);
      setOvertimeAfter(entry.overtimeMinutesAfter ?? 0);
      setOvertimeReason(entry.overtimeReason || "");
      setIsRestDay(entry.isRestDay ?? false);
      setIsHoliday(entry.isHoliday ?? false);
      setNotes(entry.notes || "");
    } else {
      // Día nuevo: autoseleccionar plantilla según el día de la semana
      const dateObj = parseISO(dateStr);
      const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const isoDay = dayOfWeek === 0 ? 7 : dayOfWeek;

      // Buscar si hay plantilla que aplique para este día
      const matchedTpl = templates.find((t) => {
        if (!t.applicableDays) return false;
        const days = Array.isArray(t.applicableDays)
          ? t.applicableDays
          : JSON.parse(t.applicableDays as any);
        return days.includes(isoDay);
      });

      const tpl = matchedTpl || templates[0];
      if (tpl) {
        setShiftType(tpl.type as any);
        setTemplateId(tpl.id);
        setActualStart(tpl.defaultStartTime || "07:00");
        setActualEnd(tpl.defaultEndTime || "15:00");
        setBreakMinutes(tpl.defaultBreakMinutes || 0);
        setPlannedStart(tpl.defaultStartTime || "");
        setPlannedEnd(tpl.defaultEndTime || "");
      } else {
        setShiftType("MORNING");
        setTemplateId("");
        setActualStart("07:00");
        setActualEnd("15:00");
        setBreakMinutes(30);
        setPlannedStart("07:00");
        setPlannedEnd("15:00");
      }

      setOvertimeBefore(0);
      setOvertimeAfter(0);
      setOvertimeReason("");
      setIsRestDay(isoDay === 6 || isoDay === 7); // Sábado o domingo por defecto
      setIsHoliday(Boolean(holidayName));
      setNotes("");
    }
  }, [isOpen, dateStr, entry, templates, holidayName]);

  // Cálculo en vivo de horas
  const preview = calculateWorkHours({
    date: dateStr,
    actualStart,
    actualEnd,
    breakMinutes,
    plannedStart: plannedStart || undefined,
    plannedEnd: plannedEnd || undefined,
    manualOvertimeMinutesBefore: overtimeBefore > 0 ? overtimeBefore : undefined,
    manualOvertimeMinutesAfter: overtimeAfter > 0 ? overtimeAfter : undefined,
  });

  // Manejar cambio de plantilla predefinida
  function handleTemplateSelect(tId: string) {
    setTemplateId(tId);
    const selected = templates.find((t) => t.id === tId);
    if (selected) {
      setShiftType(selected.type as any);
      if (selected.defaultStartTime) setActualStart(selected.defaultStartTime);
      if (selected.defaultEndTime) setActualEnd(selected.defaultEndTime);
      if (selected.defaultBreakMinutes !== null) setBreakMinutes(selected.defaultBreakMinutes ?? 0);
      if (selected.defaultStartTime) setPlannedStart(selected.defaultStartTime);
      if (selected.defaultEndTime) setPlannedEnd(selected.defaultEndTime);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const entryPayload = {
        id: entry?.id,
        date: dateStr,
        shiftType,
        templateId: templateId || null,
        plannedStart: plannedStart || null,
        plannedEnd: plannedEnd || null,
        actualStart,
        actualEnd,
        breakMinutes,
        overtimeMinutesBefore: preview.overtimeMinutesBefore,
        overtimeMinutesAfter: preview.overtimeMinutesAfter,
        overtimeReason: overtimeReason || null,
        isRestDay,
        isHoliday,
        holidayName: isHoliday ? holidayName || entry?.holidayName || "Festivo" : null,
        notes: notes || null,
      };

      // Si no hay conexión o el servidor no responde, encolar localmente
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        enqueueOfflineEntry(entryPayload);
        onSaved();
        onClose();
        return;
      }

      try {
        await saveWorkEntry(entryPayload);
        onSaved();
        onClose();
      } catch (networkOrServerError) {
        // Fallback: si falló la red durante la petición, salvar en cola local
        enqueueOfflineEntry(entryPayload);
        onSaved();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Error al guardar el registro.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!entry?.id) return;
    if (!confirm("¿Seguro que deseas eliminar el registro de este día?")) return;

    setLoading(true);
    try {
      await deleteWorkEntry(entry.id);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Error al eliminar el registro.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const formattedDate = format(parseISO(dateStr), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdrop-in">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 animate-modal-in">
        {/* Cabecera */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
              {entry ? "Detalle / Modificar Jornada" : "Registrar Nueva Jornada"}
            </span>
            <h2 className="text-lg font-bold capitalize text-white mt-0.5">{formattedDate}</h2>
            {holidayName && (
              <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                🎉 {holidayName}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumen dinámico de horas calculadas */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Ordinarias</span>
            <span className="text-lg font-bold text-indigo-400">{preview.ordinaryHours} h</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Horas Extras</span>
            <span
              className={`text-lg font-bold ${
                preview.totalOvertimeMinutes > 0 ? "text-amber-400" : "text-slate-400"
              }`}
            >
              {preview.overtimeHours} h
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wide block">Descanso</span>
            <span className="text-lg font-bold text-slate-300">{breakMinutes} min</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
          {/* Plantilla rápida */}
          {templates.length > 0 && (
            <div>
              <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Aplicar Plantilla Rápida</span>
              </label>
              <select
                value={templateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Personalizado / Sin plantilla fija</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} {tpl.defaultStartTime ? `(${tpl.defaultStartTime} - ${tpl.defaultEndTime})` : "(Flexible)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de Turno */}
          <div>
            <label className="block text-slate-400 font-medium mb-1.5">Tipo de Turno</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShiftType("MORNING")}
                className={`py-2 px-3 rounded-lg border font-medium transition text-center ${
                  shiftType === "MORNING"
                    ? "bg-blue-600/20 border-blue-500 text-blue-300"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                ☀️ Mañana
              </button>
              <button
                type="button"
                onClick={() => setShiftType("AFTERNOON")}
                className={`py-2 px-3 rounded-lg border font-medium transition text-center ${
                  shiftType === "AFTERNOON"
                    ? "bg-amber-600/20 border-amber-500 text-amber-300"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                ⛅ Tarde
              </button>
              <button
                type="button"
                onClick={() => setShiftType("OTHER")}
                className={`py-2 px-3 rounded-lg border font-medium transition text-center ${
                  shiftType === "OTHER"
                    ? "bg-purple-600/20 border-purple-500 text-purple-300"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                🔄 Otro
              </button>
            </div>
          </div>

          {/* Horario Real */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Hora Inicio</label>
              <input
                type="time"
                value={actualStart}
                onChange={(e) => setActualStart(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Hora Salida</label>
              <input
                type="time"
                value={actualEnd}
                onChange={(e) => setActualEnd(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Pausa (min)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Desglose de Horas Extras */}
          <div className="p-3.5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-3">
            <span className="text-slate-300 font-semibold block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Ajuste / Horas Extras (minutos)</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">
                  Extra al Inicio (Entrar antes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={overtimeBefore || preview.overtimeMinutesBefore}
                    onChange={(e) => setOvertimeBefore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-mono"
                  />
                  <span className="text-slate-500">min</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Extra al Final (Salir después)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={overtimeAfter || preview.overtimeMinutesAfter}
                    onChange={(e) => setOvertimeAfter(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-mono"
                  />
                  <span className="text-slate-500">min</span>
                </div>
              </div>
            </div>

            {(preview.totalOvertimeMinutes > 0 || overtimeBefore > 0 || overtimeAfter > 0) && (
              <div>
                <label className="block text-slate-400 mb-1">Motivo de horas extras</label>
                <input
                  type="text"
                  placeholder="Ej: Relevo urgente, finalización de entrega..."
                  value={overtimeReason}
                  onChange={(e) => setOvertimeReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500"
                />
              </div>
            )}
          </div>

          {/* Días especiales */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition">
              <input
                type="checkbox"
                checked={isRestDay}
                onChange={(e) => setIsRestDay(e.target.checked)}
                className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Día de Descanso Trabajado</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition">
              <input
                type="checkbox"
                checked={isHoliday}
                onChange={(e) => setIsHoliday(e.target.checked)}
                className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-0"
              />
              <span className="text-slate-300 font-medium">Festivo Trabajado</span>
            </label>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-slate-400 font-medium mb-1">Observaciones</label>
            <textarea
              rows={2}
              placeholder="Notas personales o incidencias..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {entry?.id ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? "Guardando..." : "Guardar"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
