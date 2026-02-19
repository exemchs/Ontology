---
phase: 08-product-ux-refinement
plan: 02
subsystem: ui
tags: [popover, bell-notification, alert-history, role-badge, lucide, sonner]

# Dependency graph
requires:
  - phase: 03-ontology-dashboard
    provides: getDashboardAlerts data function and Alert type
  - phase: 06-ontology-studio-user-mgmt
    provides: RoleContext and useRole hook
provides:
  - AlertBell component with popover dropdown for persistent alert visibility
  - Role indicator badge in header bar
  - Header action bar pattern (role badge + bell + cmd-k)
affects: [08-product-ux-refinement]

# Tech tracking
tech-stack:
  added: [shadcn-popover]
  patterns: [popover-notification-dropdown, role-badge-color-mapping]

key-files:
  created:
    - src/components/layout/AlertBell.tsx
    - src/components/ui/popover.tsx
  modified:
    - src/components/layout/header-bar.tsx

key-decisions:
  - "Installed shadcn Popover component as new UI dependency for notification dropdown"
  - "Warning severity badge uses custom amber styling (consistent with Phase 3 pattern)"
  - "Role badge color mapping: destructive=super_admin, blue=service_app, secondary=data_analyst, outline=auditor"

patterns-established:
  - "Popover notification dropdown: Popover + ghost icon Button + absolute positioned dot indicator"
  - "Role badge in header: useRole() + color config map for consistent role display across app"

requirements-completed: [UXR-07]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 08 Plan 02: Alert Bell & Role Badge Summary

**Notification bell icon with alert history popover and role indicator badge integrated into the global header bar**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T16:47:07Z
- **Completed:** 2026-02-19T16:49:29Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- AlertBell component with popover dropdown listing all alerts with severity badges and relative timestamps
- Red dot indicator on bell icon when unresolved alerts exist, sonner toast on mount for latest alert
- Role indicator badge in header showing current role with color-coded styling
- Header action bar organized: NamespaceSelector, Role badge, AlertBell, Cmd+K hint

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AlertBell component with popover dropdown** - `579429f` (feat)
2. **Task 2: Integrate AlertBell into HeaderBar and add role indicator** - `1e2ca7e` (feat)

## Files Created/Modified
- `src/components/layout/AlertBell.tsx` - Bell icon button with popover dropdown showing alert history
- `src/components/ui/popover.tsx` - shadcn Popover component (installed via CLI)
- `src/components/layout/header-bar.tsx` - Updated with AlertBell, role badge, and useRole integration

## Decisions Made
- Installed shadcn Popover component (was not previously available in the project)
- Warning severity badge uses custom amber styling consistent with Phase 3 RecentAlerts pattern
- Role badge color mapping follows established convention from Phase 6 (06-03 decision)
- formatRelativeTime duplicated locally in AlertBell (same pattern as Phase 3, not extracted to shared util for POC simplicity)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing shadcn Popover component**
- **Found during:** Task 1 (AlertBell component creation)
- **Issue:** Plan specifies importing from `@/components/ui/popover` but the Popover component was not installed
- **Fix:** Ran `npx shadcn@latest add popover` to install the component
- **Files modified:** src/components/ui/popover.tsx (created), package.json
- **Verification:** Import resolves, TypeScript compilation passes
- **Committed in:** 579429f (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required dependency installation. No scope creep.

## Issues Encountered
- `npm run build` has pre-existing failures in unrelated files (QueryConsole.tsx type error, GpuFunnelChart.tsx missing export) -- not caused by this plan's changes. TypeScript check confirms no errors in AlertBell or header-bar files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AlertBell provides persistent notification visibility across all pages
- Role badge enables at-a-glance role awareness in header
- Pattern ready for future live alert integration (currently uses static getDashboardAlerts)

## Self-Check: PASSED

- All 3 files exist (AlertBell.tsx, popover.tsx, header-bar.tsx)
- Both commit hashes verified (579429f, 1e2ca7e)
- AlertBell.tsx: 129 lines (min 40 required)
- header-bar.tsx contains AlertBell import and usage

---
*Phase: 08-product-ux-refinement*
*Completed: 2026-02-20*
