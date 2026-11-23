"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  warning?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  tone = "danger",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const rafId = window.requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      const cancelBtn = focusables.find((el) =>
        el.textContent?.includes(cancelLabel)
      );
      (cancelBtn ?? focusables[0] ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, cancelLabel]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Đóng hộp thoại xác nhận"
        onClick={onClose}
        className="animate-fade-in fixed inset-0 bg-slate-950/45"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-dropdown-in relative z-10 w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg focus:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                tone === "danger"
                  ? "bg-danger-tint text-danger"
                  : "bg-primary-tint text-primary"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="confirm-dialog-title"
                className="text-base font-semibold text-foreground"
              >
                {title}
              </h2>
              <div className="mt-1.5 text-sm text-foreground-muted">
                {description}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {warning ? (
          <div className="mt-4 rounded-lg border border-warning/30 bg-warning-tint px-3.5 py-2.5 text-xs text-warning-tint-ink">
            {warning}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-surface-hover"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-9 rounded-lg px-4 text-sm font-medium transition-colors duration-150 ${
              tone === "danger"
                ? "bg-danger text-white hover:opacity-90"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
