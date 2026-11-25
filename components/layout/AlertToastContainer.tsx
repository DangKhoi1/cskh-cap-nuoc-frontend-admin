"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useAlertStore } from "@/stores/alert.store";

export function AlertToastContainer() {
  const alerts = useAlertStore((s) => s.alerts);
  const dismissAlert = useAlertStore((s) => s.dismissAlert);

  if (alerts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-16 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6"
    >
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="status"
          className={`animate-panel-in pointer-events-auto flex items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-3 shadow-md ${
            alert.type === "error"
              ? "border-danger/35"
              : "border-success/30"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alert.type === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0 text-danger" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            )}
            <p className="text-sm font-medium text-foreground">
              {alert.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismissAlert(alert.id)}
            aria-label="Đóng thông báo"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
