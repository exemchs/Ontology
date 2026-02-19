"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { getMockPgTables, type PgTable } from "@/data/import-data";

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export function PostgresImportForm() {
  const [host, setHost] = useState("db.example.com");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("fab_production");
  const [schema, setSchema] = useState("public");
  const [username, setUsername] = useState("readonly_user");
  const [password, setPassword] = useState("");

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [tables, setTables] = useState<PgTable[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  function handleTestConnection() {
    setConnectionStatus("testing");
    setTimeout(() => {
      setConnectionStatus("success");
      setTables(getMockPgTables());
      setSelected(new Set(["equipment", "wafer_lots", "process_steps"]));
    }, 1200);
  }

  function toggleTable(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function handleImport() {
    setImporting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setImporting(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="size-4" />
            Connection Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Host</Label>
              <Input value={host} onChange={(e) => setHost(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Port</Label>
              <Input value={port} onChange={(e) => setPort(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Database</Label>
              <Input value={database} onChange={(e) => setDatabase(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Schema</Label>
              <Input value={schema} onChange={(e) => setSchema(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleTestConnection} disabled={connectionStatus === "testing"}>
              {connectionStatus === "testing" && <Loader2 className="size-3 animate-spin mr-1" />}
              Test Connection
            </Button>
            {connectionStatus === "success" && (
              <span className="flex items-center gap-1 text-xs text-[var(--status-healthy)]">
                <CheckCircle2 className="size-3.5" /> Connected
              </span>
            )}
            {connectionStatus === "error" && (
              <span className="flex items-center gap-1 text-xs text-[var(--status-critical)]">
                <XCircle className="size-3.5" /> Connection failed
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {tables.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Available Tables</CardTitle>
              <span className="text-xs text-muted-foreground">{selected.size} of {tables.length} selected</span>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="text-xs">Table</TableHead>
                  <TableHead className="text-xs">Rows</TableHead>
                  <TableHead className="text-xs">Columns</TableHead>
                  <TableHead className="text-xs">Dgraph Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell>
                      <Checkbox checked={selected.has(t.name)} onCheckedChange={() => toggleTable(t.name)} />
                    </TableCell>
                    <TableCell className="text-sm font-medium">{t.name}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{t.rowCount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{t.columns.length}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{t.dgraphType}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tables.length > 0 && (
        <div className="space-y-2">
          {importing && <Progress value={Math.min(progress, 100)} className="h-2" />}
          <Button size="sm" className="h-8 text-xs" onClick={handleImport} disabled={selected.size === 0 || importing}>
            {importing ? (
              <>
                <Loader2 className="size-3 animate-spin mr-1" />
                Importing... {Math.min(Math.round(progress), 100)}%
              </>
            ) : (
              `Import ${selected.size} Table${selected.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
