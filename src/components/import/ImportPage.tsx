"use client";

import { PageShell } from "@/components/ds/PageShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostgresImportForm } from "@/components/import/PostgresImportForm";
import { CsvImportForm } from "@/components/import/CsvImportForm";

export function ImportPage() {
  return (
    <PageShell
      title="Data Import"
      description="Import data from PostgreSQL or CSV files into Dgraph"
    >
      <Tabs defaultValue="postgres">
        <TabsList className="h-8">
          <TabsTrigger value="postgres" className="text-xs px-3">
            PostgreSQL
          </TabsTrigger>
          <TabsTrigger value="csv" className="text-xs px-3">
            CSV File
          </TabsTrigger>
        </TabsList>
        <TabsContent value="postgres" className="mt-3">
          <PostgresImportForm />
        </TabsContent>
        <TabsContent value="csv" className="mt-3">
          <CsvImportForm />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
