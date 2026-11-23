type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success-tint text-success-tint-ink",
  warning: "bg-warning-tint text-warning-tint-ink",
  danger: "bg-danger-tint text-danger-tint-ink",
  info: "bg-info-tint text-info-tint-ink",
  neutral: "bg-surface-subtle text-foreground-muted",
};

export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
