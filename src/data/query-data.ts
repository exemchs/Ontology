// =============================================================================
// eXemble Ontology Platform - Query Console Page Data
// =============================================================================
// Query templates, history, and PII demo data (FAB 8 rows + General 5 rows).
// =============================================================================

import type { QueryType, QueryStatus } from "@/types";

// ── Jitter Utility ──────────────────────────────────────────────────────────

function addJitter(value: number, percent: number = 5): number {
  const range = value * (percent / 100);
  return value + (Math.random() - 0.5) * 2 * range;
}

function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ── Query Templates ─────────────────────────────────────────────────────────

export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  type: QueryType;
  query: string;
}

export function getQueryTemplates(): QueryTemplate[] {
  return [
    {
      id: "tpl-001",
      name: "List all Equipment",
      description: "Retrieve all equipment nodes with basic properties",
      type: "graphql",
      query: `{
  queryEquipment {
    equipment_id
    name
    type
    manufacturer
    location
    status
  }
}`,
    },
    {
      id: "tpl-002",
      name: "Equipment by Location",
      description: "Find equipment in a specific FAB bay",
      type: "graphql",
      query: `{
  queryEquipment(filter: { location: { eq: "FAB1-BAY03" } }) {
    equipment_id
    name
    type
    status
    runs {
      name
      step_number
    }
  }
}`,
    },
    {
      id: "tpl-003",
      name: "Process Steps for Wafer",
      description: "Trace all process steps for a specific wafer lot",
      type: "dql",
      query: `{
  process_steps(func: type(Wafer)) @filter(eq(lot_id, "LOT-2024-0847")) {
    wafer_id
    lot_id
    ~produces {
      name
      step_number
      duration
      temperature
      uses {
        recipe_id
        name
        version
      }
    }
  }
}`,
    },
    {
      id: "tpl-004",
      name: "Defect Analysis",
      description: "Analyze defect distribution by severity and equipment",
      type: "dql",
      query: `{
  defects(func: type(Defect), orderdesc: severity, first: 100) {
    defect_id
    type
    severity
    size
    location_x
    location_y
    found_by {
      equipment_id
      name
      location
    }
  }
}`,
    },
    {
      id: "tpl-005",
      name: "Maintenance Schedule",
      description: "View upcoming maintenance records for equipment",
      type: "graphql",
      query: `{
  queryMaintenanceRecord(order: { asc: scheduled_date }, first: 20) {
    record_id
    type
    scheduled_date
    completed_date
    technician
    notes
    performed_on {
      equipment_id
      name
    }
  }
}`,
    },
  ];
}

// ── Query History ───────────────────────────────────────────────────────────

export interface QueryHistoryItem {
  id: string;
  queryText: string;
  queryType: QueryType;
  status: QueryStatus;
  executionTime: number;
  resultCount: number;
  createdAt: string;
  user: string;
}

export function getQueryHistory(): QueryHistoryItem[] {
  const now = new Date();
  const statuses: QueryStatus[] = ["completed", "completed", "completed", "completed", "completed", "completed", "completed", "error", "completed", "completed"];
  const users = ["admin", "analyst1", "api-server", "analyst1", "admin", "operator1", "auditor1", "analyst1", "admin", "api-server"];

  return Array.from({ length: 10 }, (_, i) => {
    const minsAgo = (i + 1) * 7 + Math.floor(Math.random() * 5);
    const isError = statuses[i] === "error";

    return {
      id: `qh-${String(i + 1).padStart(3, "0")}`,
      queryText: i % 2 === 0
        ? "{ queryEquipment { equipment_id name status } }"
        : '{ process(func: type(Process), first: 50) { name step_number } }',
      queryType: (i % 2 === 0 ? "graphql" : "dql") as QueryType,
      status: statuses[i] ?? "completed",
      executionTime: isError ? 0 : round(addJitter(i < 5 ? 45 : 120, 30), 0),
      resultCount: isError ? 0 : Math.round(addJitter(i < 5 ? 832 : 24500, 5)),
      createdAt: new Date(now.getTime() - minsAgo * 60 * 1000).toISOString(),
      user: users[i] ?? "admin",
    };
  });
}

// ── PII Demo Data ───────────────────────────────────────────────────────────

export interface FabPiiRecord {
  equipment_id: string;
  operator_name: string;
  operator_phone: string;
  operator_email: string;
  location: string;
  last_calibration: string;
  maintenance_notes: string;
  calibration_by: string;
}

export interface GeneralPiiRecord {
  customer_id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  membership: string;
}

export interface PiiDemoData {
  fab: FabPiiRecord[];
  general: GeneralPiiRecord[];
}

export function getPiiDemoData(): PiiDemoData {
  return {
    fab: [
      {
        equipment_id: "CVD-001",
        operator_name: "김민수",
        operator_phone: "010-3847-9201",
        operator_email: "minsu.kim@sksiltron.com",
        location: "FAB1-BAY03",
        last_calibration: "2025-12-15",
        maintenance_notes: "정기 점검 완료, 필터 교체",
        calibration_by: "이영희",
      },
      {
        equipment_id: "CVD-002",
        operator_name: "이영희",
        operator_phone: "010-5521-8834",
        operator_email: "younghee.lee@sksiltron.com",
        location: "FAB1-BAY03",
        last_calibration: "2025-11-28",
        maintenance_notes: "가스 라인 점검",
        calibration_by: "박준호",
      },
      {
        equipment_id: "CVD-003",
        operator_name: "박준호",
        operator_phone: "010-9012-3456",
        operator_email: "junho.park@sksiltron.com",
        location: "FAB1-BAY04",
        last_calibration: "2026-01-10",
        maintenance_notes: "챔버 클리닝 완료",
        calibration_by: "김민수",
      },
      {
        equipment_id: "Etcher-001",
        operator_name: "최서연",
        operator_phone: "010-6678-1234",
        operator_email: "seoyeon.choi@sksiltron.com",
        location: "FAB1-BAY05",
        last_calibration: "2026-01-22",
        maintenance_notes: "플라즈마 소스 교체",
        calibration_by: "정하늘",
      },
      {
        equipment_id: "Etcher-002",
        operator_name: "정하늘",
        operator_phone: "010-2234-5678",
        operator_email: "haneul.jung@sksiltron.com",
        location: "FAB1-BAY05",
        last_calibration: "2025-12-30",
        maintenance_notes: "ESC 정밀 점검",
        calibration_by: "최서연",
      },
      {
        equipment_id: "Furnace-001",
        operator_name: "강도윤",
        operator_phone: "010-7890-4567",
        operator_email: "doyun.kang@sksiltron.com",
        location: "FAB1-BAY07",
        last_calibration: "2025-11-15",
        maintenance_notes: "히터 엘리먼트 교체, 온도 캘리브레이션",
        calibration_by: "윤서진",
      },
      {
        equipment_id: "Furnace-002",
        operator_name: "윤서진",
        operator_phone: "010-1122-3344",
        operator_email: "seojin.yoon@sksiltron.com",
        location: "FAB1-BAY07",
        last_calibration: "2026-02-01",
        maintenance_notes: "보트 로더 점검",
        calibration_by: "강도윤",
      },
      {
        equipment_id: "CMP-001",
        operator_name: "한미래",
        operator_phone: "010-4455-6677",
        operator_email: "mirae.han@sksiltron.com",
        location: "FAB1-BAY04",
        last_calibration: "2026-01-18",
        maintenance_notes: "패드 컨디셔너 교체, 슬러리 라인 세척",
        calibration_by: "박준호",
      },
    ],
    general: [
      {
        customer_id: "CUST-001",
        name: "김민수",
        phone: "010-1234-5678",
        email: "minsu@example.com",
        address: "서울특별시 강남구 테헤란로 123",
        membership: "Gold",
      },
      {
        customer_id: "CUST-002",
        name: "이영희",
        phone: "010-9876-5432",
        email: "younghee@example.com",
        address: "경기도 성남시 분당구 정자동 45",
        membership: "Silver",
      },
      {
        customer_id: "CUST-003",
        name: "박준호",
        phone: "010-5555-1234",
        email: "junho@example.com",
        address: "부산광역시 해운대구 우동 678",
        membership: "Gold",
      },
      {
        customer_id: "CUST-004",
        name: "최서연",
        phone: "010-3333-7777",
        email: "seoyeon@example.com",
        address: "대전광역시 유성구 도룡동 90",
        membership: "Platinum",
      },
      {
        customer_id: "CUST-005",
        name: "정하늘",
        phone: "010-8888-2222",
        email: "haneul@example.com",
        address: "인천광역시 연수구 송도동 123",
        membership: "Silver",
      },
    ],
  };
}
