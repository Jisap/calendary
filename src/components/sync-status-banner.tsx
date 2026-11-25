"use client";

import { useState, useEffect } from "react";
import { getOfflineQueue, removeQueuedItem, type QueuedWorkEntry } from "@/lib/offline-sync";
import { saveWorkEntry } from "@/app/actions/work-entries";
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";

interface SyncStatusBannerProps {
  onSynced: () => Promise<void>;
}

export function SyncStatusBanner({ onSynced }: SyncStatusBannerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Escuchar estado de conexión del navegador
  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
      triggerSync();
    }

    function handleOffline() {
      setIsOnline(false);
    }

    function updateQueueCount() {
      setPendingCount(getOfflineQueue().length);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("offline-queue-updated", updateQueueCount);

    updateQueueCount();

    // Si al cargar hay conexión y hay elementos en cola, sincronizar
    if (navigator.onLine && getOfflineQueue().length > 0) {
      triggerSync();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("offline-queue-updated", updateQueueCount);
    };
  }, []);

  async function triggerSync() {
    const queue = getOfflineQueue();
    if (queue.length === 0 || !navigator.onLine) return;

    setSyncing(true);
    let successCount = 0;

    for (const item of queue) {
      try {
        await saveWorkEntry(item.data);
        removeQueuedItem(item.queueId);
        successCount++;
      } catch (err) {
        console.error("Error syncing item:", item, err);
      }
    }

    setSyncing(false);
    if (successCount > 0) {
      await onSynced();
    }
  }

  // Si está online y no hay nada pendiente en cola, no mostrar nada para mantener limpia la UI
  if (isOnline && pendingCount === 0 && !syncing) {
    return null;
  }

  return (
    <div
      className={`px-4 py-2.5 rounded-xl border text-xs flex items-center justify-between transition animate-in fade-in duration-200 ${
        !isOnline
          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
      }`}
    >
      <div className="flex items-center gap-2.5">
        {!isOnline ? (
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span>
          {!isOnline
            ? `Modo Sin Conexión activo. ${
                pendingCount > 0
                  ? `Tienes ${pendingCount} registro(s) guardado(s) localmente que se sincronizarán al volver a tener cobertura.`
                  : "Puedes fichar con normalidad; tus cambios se guardarán en tu dispositivo."
              }`
            : syncing
            ? `Sincronizando ${pendingCount} registro(s) pendiente(s) con la nube...`
            : `${pendingCount} registro(s) pendiente(s) de sincronizar.`}
        </span>
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 shrink-0 ml-3"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Sincronizando..." : "Sincronizar ahora"}</span>
        </button>
      )}
    </div>
  );
}
