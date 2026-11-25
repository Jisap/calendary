"use client";

import { useState, useEffect, useMemo } from "react";
import { type WorkEntry } from "@/db/schema";
import { DollarSign, ChevronDown, Info, HelpCircle } from "lucide-react";

export interface OvertimeRates {
  normalRate: number; // Precio/hora extra en jornada normal
  restDayRate: number; // Precio/hora extra en día de descanso
  holidayRate: number; // Precio/hora extra en día festivo
}

const STORAGE_KEY = "calendary_overtime_rates";

const DEFAULT_RATES: OvertimeRates = {
  normalRate: 0,
  restDayRate: 0,
  holidayRate: 0,
};

interface OvertimeCompensationProps {
  entries: WorkEntry[];
}

export function OvertimeCompensation({ entries }: OvertimeCompensationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rates, setRates] = useState<OvertimeRates>(DEFAULT_RATES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar tarifas guardadas en localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRates(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error reading overtime rates from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar tarifas automáticamente cuando cambian
  function updateRate(key: keyof OvertimeRates, value: number) {
    const updated = { ...rates, [key]: Math.max(0, value) };
    setRates(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving overtime rates", e);
    }
  }

  // Desglose de horas extras según los 3 escenarios
  const breakdown = useMemo(() => {
    let normalOvertimeHours = 0;
    let restDayOvertimeHours = 0;
    let holidayOvertimeHours = 0;

    entries.forEach((e) => {
      const extra = e.totalOvertimeHours ?? 0;
      if (extra <= 0) return;

      if (e.isHoliday) {
        holidayOvertimeHours += extra;
      } else if (e.isRestDay) {
        restDayOvertimeHours += extra;
      } else {
        normalOvertimeHours += extra;
      }
    });

    const normalTotal = parseFloat((normalOvertimeHours * rates.normalRate).toFixed(2));
    const restDayTotal = parseFloat((restDayOvertimeHours * rates.restDayRate).toFixed(2));
    const holidayTotal = parseFloat((holidayOvertimeHours * rates.holidayRate).toFixed(2));
    const grandTotal = parseFloat((normalTotal + restDayTotal + holidayTotal).toFixed(2));

    return {
      normalHours: parseFloat(normalOvertimeHours.toFixed(2)),
      restDayHours: parseFloat(restDayOvertimeHours.toFixed(2)),
      holidayHours: parseFloat(holidayOvertimeHours.toFixed(2)),
      normalTotal,
      restDayTotal,
      holidayTotal,
      grandTotal,
      hasAnyRate: rates.normalRate > 0 || rates.restDayRate > 0 || rates.holidayRate > 0,
    };
  }, [entries, rates]);

  if (!isLoaded) return null;

  return (
    <div className="rounded-xl border border-slate-700/60 dark:border-slate-800 bg-slate-800/30 dark:bg-slate-900/40 p-4 transition text-xs">
      {/* Botón para desplegar/plegar (completamente opcional) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-slate-200 group-hover:text-white transition flex items-center gap-1.5">
              <span>Estimación Económica de Horas Extras</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">
                Opcional
              </span>
            </span>
            <p className="text-[11px] text-slate-400">
              Desglose en día normal, descanso trabajado o festivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {breakdown.hasAnyRate && breakdown.grandTotal > 0 && (
            <span className="font-mono text-emerald-400 font-bold text-sm">
              +{breakdown.grandTotal.toFixed(2)} €
            </span>
          )}
          <div className="p-1 rounded-md text-slate-400 group-hover:text-slate-200 transition">
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-out ${
                isOpen ? "rotate-180 text-emerald-400" : "rotate-0"
              }`}
            />
          </div>
        </div>
      </button>

      {/* Contenido desplegable con animación fluida */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 dark:border-slate-800 space-y-4 animate-accordion-expand">
          <div className="text-[11px] text-slate-400 flex items-start gap-1.5 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/40">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              Introduce las tarifas pactadas (€/hora). Los importes se calculan y guardan en tu
              navegador de forma privada sin alterar ningún registro de tu jornada.
            </span>
          </div>

          {/* Tres tipos de horas extras con sus inputs de tarifa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Día Normal */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="font-medium text-slate-300 block mb-1">1. Día Ordinario</span>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
                <span>Realizadas:</span>
                <span className="font-mono font-semibold text-white">{breakdown.normalHours} h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={rates.normalRate || ""}
                  onChange={(e) => updateRate("normalRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 font-mono">€/h</span>
              </div>
              {rates.normalRate > 0 && (
                <span className="block mt-2 text-right font-mono font-semibold text-emerald-400">
                  = {breakdown.normalTotal.toFixed(2)} €
                </span>
              )}
            </div>

            {/* 2. Día de Descanso */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="font-medium text-slate-300 block mb-1">2. En Día de Descanso</span>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
                <span>Realizadas:</span>
                <span className="font-mono font-semibold text-white">{breakdown.restDayHours} h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={rates.restDayRate || ""}
                  onChange={(e) => updateRate("restDayRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 font-mono">€/h</span>
              </div>
              {rates.restDayRate > 0 && (
                <span className="block mt-2 text-right font-mono font-semibold text-emerald-400">
                  = {breakdown.restDayTotal.toFixed(2)} €
                </span>
              )}
            </div>

            {/* 3. Festivo */}
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="font-medium text-slate-300 block mb-1">3. En Día Festivo</span>
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-2">
                <span>Realizadas:</span>
                <span className="font-mono font-semibold text-white">{breakdown.holidayHours} h</span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={rates.holidayRate || ""}
                  onChange={(e) => updateRate("holidayRate", parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 font-mono">€/h</span>
              </div>
              {rates.holidayRate > 0 && (
                <span className="block mt-2 text-right font-mono font-semibold text-emerald-400">
                  = {breakdown.holidayTotal.toFixed(2)} €
                </span>
              )}
            </div>
          </div>

          {/* Resumen total estimado */}
          {breakdown.hasAnyRate && (
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <span className="font-semibold text-emerald-300">Total Estimado Horas Extras:</span>
              <span className="font-mono font-bold text-base text-emerald-400">
                {breakdown.grandTotal.toFixed(2)} €
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
