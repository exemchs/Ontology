export interface PgTable {
  name: string;
  rowCount: number;
  columns: { name: string; type: string }[];
  dgraphType: string;
}

export function getMockPgTables(): PgTable[] {
  return [
    {
      name: "equipment",
      rowCount: 1240,
      columns: [
        { name: "id", type: "serial" },
        { name: "name", type: "varchar(255)" },
        { name: "type", type: "varchar(100)" },
        { name: "status", type: "varchar(50)" },
        { name: "location", type: "varchar(255)" },
      ],
      dgraphType: "Equipment",
    },
    {
      name: "wafer_lots",
      rowCount: 8420,
      columns: [
        { name: "lot_id", type: "varchar(50)" },
        { name: "product", type: "varchar(100)" },
        { name: "quantity", type: "integer" },
        { name: "start_date", type: "timestamp" },
      ],
      dgraphType: "WaferLot",
    },
    {
      name: "process_steps",
      rowCount: 34500,
      columns: [
        { name: "step_id", type: "serial" },
        { name: "lot_id", type: "varchar(50)" },
        { name: "step_name", type: "varchar(100)" },
        { name: "duration_min", type: "integer" },
        { name: "temperature", type: "numeric(6,1)" },
      ],
      dgraphType: "ProcessStep",
    },
    {
      name: "sensors",
      rowCount: 560,
      columns: [
        { name: "sensor_id", type: "serial" },
        { name: "equipment_id", type: "integer" },
        { name: "sensor_type", type: "varchar(50)" },
        { name: "unit", type: "varchar(20)" },
      ],
      dgraphType: "Sensor",
    },
    {
      name: "measurements",
      rowCount: 1250000,
      columns: [
        { name: "id", type: "bigserial" },
        { name: "sensor_id", type: "integer" },
        { name: "value", type: "numeric(10,4)" },
        { name: "timestamp", type: "timestamp" },
      ],
      dgraphType: "Measurement",
    },
  ];
}

export interface CsvColumn {
  name: string;
  detectedType: "string" | "number" | "date";
  sampleValues: string[];
  predicate: string;
}

export function getMockCsvColumns(): CsvColumn[] {
  return [
    {
      name: "equipment_name",
      detectedType: "string",
      sampleValues: ["CVD Chamber A", "Plasma Etcher 1", "Furnace B"],
      predicate: "Equipment.name",
    },
    {
      name: "equipment_type",
      detectedType: "string",
      sampleValues: ["CVD", "Etcher", "Furnace"],
      predicate: "Equipment.type",
    },
    {
      name: "temperature",
      detectedType: "number",
      sampleValues: ["1050", "65", "680"],
      predicate: "Equipment.temperature",
    },
    {
      name: "install_date",
      detectedType: "date",
      sampleValues: ["2024-01-15", "2024-03-22", "2023-11-08"],
      predicate: "Equipment.installedAt",
    },
  ];
}
