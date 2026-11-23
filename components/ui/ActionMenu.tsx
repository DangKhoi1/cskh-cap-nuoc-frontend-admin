"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export function ActionMenu({
  items,
  ariaLabel = "Mở menu thao tác",
}: {
  items: ActionMenuItem[];
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const handleScroll = () => setOpen(false);

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192;
      const estimatedHeight = items.length * 36 + 12;
      const left = Math.max(
        12,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)
      );
      const openAbove = rect.bottom + 6 + estimatedHeight > window.innerHeight;
      const top = openAbove
        ? Math.max(12, rect.top - estimatedHeight - 6)
        : rect.bottom + 6;
      setCoords({ top, left });
    }
    setOpen((prev) => !prev);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-foreground-muted transition-colors duration-150 hover:bg-surface-hover hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ top: coords.top, left: coords.left }}
          className="animate-dropdown-in fixed z-50 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-md"
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-45 ${
                item.tone === "danger"
                  ? "text-danger hover:bg-danger-tint"
                  : "text-foreground hover:bg-surface-hover"
              }`}
            >
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

