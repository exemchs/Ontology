"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getMockCsvColumns, type CsvColumn } from "@/data/import-data";

export function CsvImportForm() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<CsvColumn[]>([]);
  const [targetType, setTargetType] = useState("Equipment");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setColumns(getMockCsvColumns());
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".csv")) handleFile(f);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function updatePredicate(colName: string, predicate: string) {
    setColumns((prev) =>
      prev.map((c) => (c.name === colName ? { ...c, predicate } : c))
    );
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
        return prev + Math.random() * 20;
      });
    }, 300);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/40">
        <CardContent className="pt-6">
          {!file ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/50"
              }`}
            >
              <Upload className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drop a CSV file here or click to browse</p>
              <p className="text-xs text-muted-foreground/60">Supports .csv files up to 100MB</p>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </label>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file.name}</span>
                <Badge variant="secondary" className="text-[10px]">{(file.size / 1024).toFixed(1)} KB</Badge>
              </div>
              <Button variant="ghost" size="icon" className="size-6" onClick={() => { setFile(null); setColumns([]); }}>
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {columns.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Column Mapping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">CSV Column</TableHead>
                  <TableHead className="text-xs">Detected Type</TableHead>
                  <TableHead className="text-xs">Sample Values</TableHead>
                  <TableHead className="text-xs">Dgraph Predicate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((col) => (
                  <TableRow key={col.name}>
                    <TableCell className="text-sm font-medium">{col.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{col.detectedType}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{col.sampleValues.join(", ")}</TableCell>
                    <TableCell>
                      <Input value={col.predicate} onChange={(e) => updatePredicate(col.name, e.target.value)} className="h-7 text-xs w-[180px]" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs">Target Dgraph Type</Label>
                <Input value={targetType} onChange={(e) => setTargetType(e.target.value)} className="h-8 text-sm w-[200px]" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {columns.length > 0 && (
        <div className="space-y-2">
          {importing && <Progress value={Math.min(progress, 100)} className="h-2" />}
          <Button size="sm" className="h-8 text-xs" onClick={handleImport} disabled={importing || !targetType.trim()}>
            {importing ? (
              <>
                <Loader2 className="size-3 animate-spin mr-1" />
                Importing... {Math.min(Math.round(progress), 100)}%
              </>
            ) : (
              "Import CSV"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
