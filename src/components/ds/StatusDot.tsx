import { cn } from "@/lib/utils";

type Status = "healthy" | "warning" | "critical";

interface StatusDotProps {
  status: Status;
  label?: string;
  className?: string;
}

const statusColor: Record<Status, string> = {
  healthy: "bg-[var(--status-healthy)]",
  warning: "bg-[var(--status-warning)]",
  critical: "bg-[var(--status-critical)]",
};

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("size-1.5 rounded-full shrink-0", statusColor[status])} />
      {label && (
        <span className="text-xs text-muted-foreground">{label}</span>
      )}
    </span>
  );
}
