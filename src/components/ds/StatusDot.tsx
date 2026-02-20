import { cn } from "@/lib/utils";

type Status = "healthy" | "warning" | "critical";

interface StatusDotProps {
  status: Status;
  label?: string;
  className?: string;
}

const dotColor: Record<Status, string> = {
  healthy: "bg-[var(--status-healthy)]",
  warning: "bg-[var(--status-warning)]",
  critical: "bg-[var(--status-critical)]",
};

const textColor: Record<Status, string> = {
  healthy: "text-[var(--status-healthy)]",
  warning: "text-[var(--status-warning)]",
  critical: "text-[var(--status-critical)]",
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full shrink-0", dotColor[status])} />
      {label && (
        <span className={cn("text-xs", textColor[status])}>{label}</span>
      )}
    </span>
  );
}
