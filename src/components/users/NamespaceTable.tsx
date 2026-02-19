"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useNamespace } from "@/contexts/NamespaceContext";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-[var(--status-healthy)]/10 text-[var(--status-healthy)] border-[var(--status-healthy)]/20" },
  "read-only": { label: "Read-only", className: "bg-[var(--status-warning)]/10 text-[var(--status-warning)] border-[var(--status-warning)]/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
};

export function NamespaceTable() {
  const { namespaces } = useNamespace();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Namespace</TableHead>
          <TableHead>Node Count</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {namespaces.map((ns) => {
          const status = STATUS_VARIANT[ns.status] ?? STATUS_VARIANT.inactive;
          return (
            <TableRow key={ns.name}>
              <TableCell className="font-medium">{ns.name}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {ns.nodeCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">{ns.createdAt}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("text-xs", status.className)}>
                  {status.label}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
