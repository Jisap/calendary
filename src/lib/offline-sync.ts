"use client";

import { type SaveWorkEntryInput } from "@/app/actions/work-entries";

const OFFLINE_QUEUE_KEY = "calendary_offline_work_entries_queue";

export interface QueuedWorkEntry {
  queueId: string;
  data: SaveWorkEntryInput;
  timestamp: number;
}

/**
 * Obtiene las operaciones pendientes de sincronización en la cola offline.
 */
export function getOfflineQueue(): QueuedWorkEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading offline queue", e);
    return [];
  }
}

/**
 * Guarda una jornada en la cola local si el usuario no tiene conexión.
 */
export function enqueueOfflineEntry(data: SaveWorkEntryInput): QueuedWorkEntry {
  const queue = getOfflineQueue();
  const item: QueuedWorkEntry = {
    queueId: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    data,
    timestamp: Date.now(),
  };

  // Reemplazar si ya había una operación en cola para esa misma fecha
  const filtered = queue.filter((q) => q.data.date !== data.date);
  filtered.push(item);

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new Event("offline-queue-updated"));
  return item;
}

/**
 * Elimina un elemento sincronizado de la cola.
 */
export function removeQueuedItem(queueId: string) {
  const queue = getOfflineQueue().filter((q) => q.queueId !== queueId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event("offline-queue-updated"));
}

/**
 * Limpia toda la cola offline.
 */
export function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
  window.dispatchEvent(new Event("offline-queue-updated"));
}
