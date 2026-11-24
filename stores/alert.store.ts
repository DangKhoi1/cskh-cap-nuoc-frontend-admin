import { create } from "zustand";

export interface AlertItem {
  id: string;
  type: "success" | "error";
  message: string;
}

interface AlertState {
  alerts: AlertItem[];
  showSuccessAlert: (message: string) => void;
  showErrorAlert: (message: string) => void;
  dismissAlert: (id: string) => void;
}

const timers = new Map<string, number>();

function pushAlert(
  type: "success" | "error",
  message: string,
  set: (fn: (state: AlertState) => Partial<AlertState>) => void
) {
  const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  set((state) => ({
    alerts: [...state.alerts, { id, type, message }],
  }));

  if (typeof window !== "undefined") {
    const timer = window.setTimeout(() => {
      timers.delete(id);
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
      }));
    }, 4500);
    timers.set(id, timer);
  }
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  showSuccessAlert: (message) => pushAlert("success", message, set),
  showErrorAlert: (message) => pushAlert("error", message, set),
  dismissAlert: (id) => {
    const timer = timers.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    }));
  },
}));
