"use client";

import { useState } from "react";
import { type ShiftTemplate } from "@/db/schema";
import { saveShiftTemplate, deleteShiftTemplate } from "@/app/actions/template-actions";
import { X, Plus, Edit2, Trash2, Check, Clock, Calendar, Sparkles, AlertCircle } from "lucide-react";

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: ShiftTemplate[];
  onSaved: () => Promise<void>;
}

const DAYS_OF_WEEK = [
  { id: 1, label: "Lun", full: "Lunes" },
  { id: 2, label: "Mar", full: "Martes" },
  { id: 3, label: "Mié", full: "Miércoles" },
  { id: 4, label: "Jue", full: "Jueves" },
  { id: 5, label: "Vie", full: "Viernes" },
  { id: 6, label: "Sáb", full: "Sábado" },
  { id: 7, label: "Dom", full: "Domingo" },
];

export function TemplatesModal({ isOpen, onClose, templates, onSaved }: TemplatesModalProps) {
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Campos del formulario
  const [name, setName] = useState("");
  const [type, setType] = useState<"MORNING" | "AFTERNOON" | "NIGHT" | "OTHER">("MORNING");
  const [isFlexible, setIsFlexible] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState("07:00");
  const [defaultEndTime, setDefaultEndTime] = useState("15:00");
  const [defaultBreakMinutes, setDefaultBreakMinutes] = useState(30);
  const [applicableDays, setApplicableDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function handleStartCreate() {
    setEditingTemplate(null);
    setName("");
    setType("MORNING");
    setIsFlexible(false);
    setDefaultStartTime("07:00");
    setDefaultEndTime("15:00");
    setDefaultBreakMinutes(30);
    setApplicableDays([1, 2, 3]);
    setNotes("");
    setError(null);
    setIsCreating(true);
  }

  function handleStartEdit(tpl: ShiftTemplate) {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setType(tpl.type as any);
    setIsFlexible(tpl.isFlexible ?? false);
    setDefaultStartTime(tpl.defaultStartTime || "07:00");
    setDefaultEndTime(tpl.defaultEndTime || "15:00");
    setDefaultBreakMinutes(tpl.defaultBreakMinutes ?? 0);

    const days = Array.isArray(tpl.applicableDays)
      ? tpl.applicableDays
      : typeof tpl.applicableDays === "string"
      ? JSON.parse(tpl.applicableDays)
      : [];
    setApplicableDays(days);
    setNotes(tpl.notes || "");
    setError(null);
    setIsCreating(true);
  }

  function toggleDay(dayId: number) {
    if (applicableDays.includes(dayId)) {
      setApplicableDays(applicableDays.filter((d) => d !== dayId));
    } else {
      setApplicableDays([...applicableDays, dayId].sort());
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Por favor ingresa un nombre descriptivo para la plantilla.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await saveShiftTemplate({
        id: editingTemplate?.id,
        name: name.trim(),
        type,
        isFlexible,
        defaultStartTime: isFlexible ? null : defaultStartTime,
        defaultEndTime: isFlexible ? null : defaultEndTime,
        defaultBreakMinutes,
        applicableDays,
        notes: notes || null,
      });

      await onSaved();
      setIsCreating(false);
      setEditingTemplate(null);
    } catch (err: any) {
      setError(err?.message || "Error al guardar la plantilla.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Deseas eliminar esta plantilla? Las jornadas ya guardadas no se alterarán.")) return;

    setLoading(true);
    try {
      await deleteShiftTemplate(id);
      await onSaved();
    } catch (err: any) {
      setError(err?.message || "Error al eliminar plantilla.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-backdrop-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 animate-modal-in">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Configuración de Plantillas</h2>
              <p className="text-xs text-slate-400">
                Personaliza tus horarios fijos, mañanas especiales y tardes flexibles
              </p>
            </div>
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

        {/* Vista: Creando o Editando Plantilla */}
        {isCreating ? (
          <form onSubmit={handleSave} className="mt-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-semibold text-slate-200 text-sm">
                {editingTemplate ? `Editar: ${editingTemplate.name}` : "Nueva Plantilla de Horario"}
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Volver a la lista
              </button>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nombre de la plantilla</label>
              <input
                type="text"
                placeholder="Ej: Mañana Lun-Mié, Mañana Jue-Vie, Tarde Flexible..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Tipo de turno */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Tipo de Turno</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setType("MORNING")}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition text-center ${
                      type === "MORNING"
                        ? "bg-blue-600/20 border-blue-500 text-blue-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    Mañana
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("AFTERNOON")}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition text-center ${
                      type === "AFTERNOON"
                        ? "bg-amber-600/20 border-amber-500 text-amber-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    Tarde
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("OTHER")}
                    className={`py-1.5 px-2 rounded-lg border font-medium transition text-center ${
                      type === "OTHER"
                        ? "bg-purple-600/20 border-purple-500 text-purple-300"
                        : "bg-slate-800/60 border-slate-700 text-slate-400"
                    }`}
                  >
                    Otro
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1.5">Flexibilidad</label>
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/60 border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFlexible}
                    onChange={(e) => setIsFlexible(e.target.checked)}
                    className="rounded bg-slate-700 border-slate-600 text-indigo-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Horario flexible / variable</span>
                </label>
              </div>
            </div>

            {/* Horarios fijos si no es flexible */}
            {!isFlexible && (
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Hora Entrada Habitual</label>
                  <input
                    type="time"
                    value={defaultStartTime}
                    onChange={(e) => setDefaultStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Hora Salida Habitual</label>
                  <input
                    type="time"
                    value={defaultEndTime}
                    onChange={(e) => setDefaultEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Pausa (min)</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={defaultBreakMinutes}
                    onChange={(e) => setDefaultBreakMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Días aplicables por defecto para sugerencia automática */}
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">
                Días de la semana en que aplica esta plantilla (sugerencia automática)
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const active = applicableDays.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDay(d.id)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                        active
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Notas / Convenio</label>
              <textarea
                rows={2}
                placeholder="Observaciones de esta plantilla..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? "Guardando..." : "Guardar Plantilla"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Vista: Lista de Plantillas */
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Plantillas Activas ({templates.length})
              </span>
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Plantilla</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {templates.map((tpl) => {
                const days = Array.isArray(tpl.applicableDays)
                  ? tpl.applicableDays
                  : typeof tpl.applicableDays === "string"
                  ? JSON.parse(tpl.applicableDays)
                  : [];

                const isMorning = tpl.type === "MORNING";
                const isAfternoon = tpl.type === "AFTERNOON";

                return (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                            isMorning
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : isAfternoon
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {isMorning ? "Mañana" : isAfternoon ? "Tarde" : "Otro"}
                        </span>
                        <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        {tpl.isFlexible ? (
                          <span className="text-amber-400 font-medium">Horario Flexible</span>
                        ) : (
                          <span className="font-mono text-slate-300">
                            {tpl.defaultStartTime} - {tpl.defaultEndTime} ({tpl.defaultBreakMinutes}m pausa)
                          </span>
                        )}

                        {days.length > 0 && (
                          <span className="text-slate-500">
                            • Días: {days.map((d: number) => DAYS_OF_WEEK.find((x) => x.id === d)?.label).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(tpl)}
                        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tpl.id)}
                        className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
