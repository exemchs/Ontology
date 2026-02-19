// =============================================================================
// eXemble Ontology Platform - Query Result Export Utilities
// =============================================================================
// CSV and JSON export functions for query result data.
// =============================================================================

/**
 * Export data as a JSON file download.
 */
export function exportJson(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Export data as a CSV file download.
 */
export function exportCsv(
  data: Record<string, unknown>[],
  filename: string
): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);

  const escapeCell = (value: unknown): string => {
    const str = String(value ?? "");
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((row) =>
    headers.map((h) => escapeCell(row[h])).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
