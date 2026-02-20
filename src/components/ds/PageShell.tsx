import { cn } from "@/lib/utils";

interface PageShellProps {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

export function PageShell({ title, description, className, children }: PageShellProps) {
  return (
    <div className={cn("flex flex-col gap-3 p-4", className)}>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
