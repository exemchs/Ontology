---
phase: 01-foundation-data-layer
plan: 04
subsystem: data
tags: [typescript, hardcoded-data, pii, masking, jitter, rbac, korean-data]

# Dependency graph
requires:
  - phase: 01-02
    provides: "TypeScript domain types (21 named exports) for type-safe data files"
provides:
  - "5 client data files (dashboard/dgraph/gpu/studio/query) with jitter for live feel"
  - "PII demo data: FAB Equipment 8 rows + General PII 5 rows with Korean names/phones/emails"
  - "PII masking functions (maskName/Phone/Email/Id/Address) for Korean data patterns"
  - "Role-based PII field configs (fabPiiFieldConfigs + generalPiiFieldConfigs) with 4-role action mapping"
  - "applyPiiMasking utility for action-based value transformation"
affects: [02, 03, 04, 05, 06, 07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Data files export functions (not static objects) for per-call jitter"
    - "addJitter(value, percent) inline utility in each data file"
    - "PiiAction type: plain | masked | anonymized | denied"
    - "PiiFieldRule interface: field + level + actions per role"
    - "getMaskFn resolver maps field names to masking functions"

key-files:
  created:
    - "src/data/dashboard-data.ts"
    - "src/data/dgraph-data.ts"
    - "src/data/gpu-data.ts"
    - "src/data/studio-data.ts"
    - "src/data/query-data.ts"
    - "src/data/pii-config.ts"
    - "src/lib/pii-masking.ts"
  modified: []

key-decisions:
  - "Inline addJitter helper per data file instead of shared import (chart-utils.ts not yet created)"
  - "PII config uses PiiAction enum with getMaskFn resolver instead of direct function references in config"
  - "FAB PII fields follow plan spec (equipment_id/operator_name/phone/email/location/last_calibration/maintenance_notes/calibration_by)"
  - "maintenance_notes masking: first 4 chars + ellipsis for field-appropriate partial visibility"

patterns-established:
  - "Data functions return fresh copies with jitter on each call"
  - "PII masking: pure functions, no side effects, Korean-language aware"
  - "Role-action matrix in typed config arrays for declarative PII policy"

requirements-completed: [DATA-03, DATA-04]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 1 Plan 4: Client Data Files + PII Masking Summary

**5 hardcoded data files with per-call jitter for live monitoring feel, plus PII masking system with Korean-language maskName/Phone/Email/Id/Address and 4-role RBAC field configs**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T06:09:03Z
- **Completed:** 2026-02-19T06:12:59Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- 5 data files (dashboard/dgraph/gpu/studio/query) all export functions that return fresh jittered data on each call, typed against src/types/index.ts
- Dashboard: 4 metric cards, 3 gauges, 2 time series (24 points each)
- DGraph: 12 cluster nodes, 18 force-sim links, 3 shard groups, 50 query scatter points
- GPU: 4 cards, 16 time series (4 metrics x 4 GPUs x 24 points), 96 heatmap cells, 4 comparison items
- Studio: 6 ontology types with predicates and relations, type distribution chart data
- Query: 5 templates (3 GraphQL + 2 DQL), 10 history items, PII demo data
- PII demo data: FAB Equipment 8 rows + General 5 rows with Korean names (김민수, 이영희, etc.), Korean phone numbers (010-XXXX-XXXX), @sksiltron.com emails
- 7 masking functions: maskName, maskPhone, maskEmail, maskId, maskAddress, anonymize, deny
- Role-based PII configs: FAB 8 fields + General 6 fields with 4-role action matrices
- applyPiiMasking utility resolves action to appropriate mask function

## Task Commits

Each task was committed atomically:

1. **Task 1: Client data files (dashboard/dgraph/gpu/studio/query)** - `f3b5857` (feat)
2. **Task 2: PII masking functions + field config** - `8391803` (feat)

## Files Created/Modified
- `src/data/dashboard-data.ts` - Dashboard metrics, gauges, time series with jitter (134 lines)
- `src/data/dgraph-data.ts` - Cluster nodes, links, shards, query scatter (164 lines)
- `src/data/gpu-data.ts` - GPU cards, multi-metric time series, heatmap, comparison (168 lines)
- `src/data/studio-data.ts` - 6 ontology types, type distribution chart data (136 lines)
- `src/data/query-data.ts` - Query templates, history, FAB+General PII demo data (325 lines)
- `src/data/pii-config.ts` - FAB/General PII field rules, getMaskFn, applyPiiMasking (166 lines)
- `src/lib/pii-masking.ts` - 7 masking pure functions for Korean PII patterns (82 lines)

## Decisions Made
- Used inline addJitter helper per data file rather than importing from chart-utils.ts (which does not exist yet; Plan 01-03 will create it). This avoids a circular dependency and keeps each data file self-contained.
- PII config uses a `PiiAction` string enum (`"plain" | "masked" | "anonymized" | "denied"`) with a `getMaskFn` resolver function, rather than storing function references directly in the config. This makes the config serializable and testable.
- FAB PII fields use the plan-specified schema (equipment_id, operator_name, operator_phone, operator_email, location, last_calibration, maintenance_notes, calibration_by) which differs slightly from PRD section 4.1.
- maintenance_notes masking shows first 4 characters + "..." for field-appropriate partial visibility rather than a generic mask.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 data files ready for page component consumption (Phases 2-6)
- PII masking system ready for Query Console RBAC demo (Phase 6)
- TypeScript strict mode compilation passes with all 7 new files
- No blockers for next phase execution

## Self-Check: PASSED

- FOUND: src/data/dashboard-data.ts
- FOUND: src/data/dgraph-data.ts
- FOUND: src/data/gpu-data.ts
- FOUND: src/data/studio-data.ts
- FOUND: src/data/query-data.ts
- FOUND: src/data/pii-config.ts
- FOUND: src/lib/pii-masking.ts
- FOUND: commit f3b5857 (Task 1)
- FOUND: commit 8391803 (Task 2)

---
*Phase: 01-foundation-data-layer*
*Completed: 2026-02-19*
