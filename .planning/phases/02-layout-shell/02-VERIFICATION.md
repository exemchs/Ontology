---
phase: 02-layout-shell
verified: 2026-02-19T08:41:33Z
status: passed
score: 11/12 must-haves verified
gaps:
  - truth: "AUTH-03 requirement partially implemented (역할 인디케이터 missing)"
    status: partial
    reason: "REQUIREMENTS.md specifies AUTH-03 as HeaderBar (브레드크럼, 검색, 테마 토글, 역할 인디케이터). The implemented header-bar.tsx has breadcrumb + Cmd+K hint only. No role indicator is present anywhere in the codebase. The plan scoped this down without flagging the gap against the requirement."
    artifacts:
      - path: "src/components/layout/header-bar.tsx"
        issue: "No role indicator component — role display is absent from the header"
    missing:
      - "Role indicator UI element in HeaderBar (can be a simple badge showing current user role, or deferred to a future phase with explicit requirement update)"
human_verification:
  - test: "로그인 후 사이드바 접기/펼치기 동작 확인"
    expected: "토글 버튼 클릭 시 사이드바가 아이콘 전용 모드로 전환되고 eX로 로고 축소"
    why_human: "Shadcn SidebarProvider의 collapsible=icon 동작은 실제 렌더링 환경에서만 검증 가능"
  - test: "D3 force graph 애니메이션 확인 (로그인 화면 우측 패널)"
    expected: "6개 온톨로지 노드가 력으로 서로 당기고 밀면서 부드럽게 움직임, alphaTarget(0.02) 연속 드리프트"
    why_human: "D3 시뮬레이션 애니메이션은 실제 브라우저 렌더링으로만 확인 가능"
  - test: "Welcome Popup 재등장 동작 확인 (로그아웃 후 재로그인)"
    expected: "로그아웃 시 WELCOME_KEY sessionStorage 삭제 -> 재로그인 후 팝업 재등장"
    why_human: "sessionStorage 클리어와 팝업 재등장 사이클은 브라우저 세션 상태 의존"
---

# Phase 2: Layout Shell Verification Report

**Phase Goal:** 사용자가 비밀번호로 진입하여 6개 페이지를 사이드바로 탐색할 수 있는 완전한 앱 셸
**Verified:** 2026-02-19T08:41:33Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 비밀번호 입력 없이는 어떤 페이지에도 접근할 수 없다 | VERIFIED | `(authenticated)/layout.tsx` L22: `router.replace("/login")` when `isAuthenticated === false`; null state shows loading/returns null (FOUC 방지) |
| 2 | 올바른 비밀번호 입력 후 대시보드(/)로 리다이렉트된다 | VERIFIED | `login/page.tsx` L27-28: `login(password)` 성공 시 `router.push("/")` |
| 3 | 잘못된 비밀번호 입력 시 빨간 인라인 에러 텍스트가 표시된다 | VERIFIED | `login/page.tsx` L59-61: `{error && <p className="text-sm text-destructive">{error}</p>}`, `"비밀번호가 일치하지 않습니다"` |
| 4 | 이미 인증된 상태에서 /login 접근 시 /로 리다이렉트된다 | VERIFIED | `login/page.tsx` L17-21: `useEffect` checks `isAuthenticated === true` → `router.replace("/")` |
| 5 | 6개 URL 경로가 모두 존재하고 각각 스텁 페이지를 렌더한다 | VERIFIED | 6개 파일 모두 확인: `/`, `/monitoring/dgraph`, `/monitoring/gpu`, `/workspace/studio`, `/workspace/query`, `/admin/users` — 각각 제목 h1 렌더 |
| 6 | 로그인 페이지에서 좌/우 분할 레이아웃이 보인다 (폼 왼쪽, D3 그래프 오른쪽) | VERIFIED | `login/page.tsx`: `flex h-screen` 컨테이너, `w-1/2` 좌측 폼 패널, `w-1/2` 우측 `<LoginGraph />` |
| 7 | 사이드바에서 6개 페이지를 모두 클릭하여 이동할 수 있다 | VERIFIED | `app-sidebar.tsx`: `navigationGroups` 4그룹 6항목 매핑, `Link href={item.url}` 각 항목 |
| 8 | 현재 페이지가 사이드바에서 하이라이트된다 | VERIFIED | `app-sidebar.tsx` L55: `isActive={pathname === item.url}` — shadcn `SidebarMenuButton` built-in active styling |
| 9 | 사이드바를 접기 버튼으로 아이콘만 보이게 축소할 수 있다 | VERIFIED (human needed) | `Sidebar collapsible="icon"`, `useSidebar().state` 감지로 로고 eX/eXemble, 텍스트/스위치 조건부 렌더 — 실제 동작은 human 확인 필요 |
| 10 | Cmd+K로 Command Palette가 열리고 페이지 검색/이동이 동작한다 | VERIFIED | `command-palette.tsx` L24-29: `keydown` 이벤트 리스너로 `e.metaKey && e.key === "k"` 감지, `router.push(item.url)` 실행 |
| 11 | 첫 방문 시 Welcome Popup이 한국어로 표시되고 닫으면 다시 나타나지 않는다 | VERIFIED | `welcome-popup.tsx`: sessionStorage `WELCOME_KEY` 미존재 시 open=true, 닫기 시 `sessionStorage.setItem(WELCOME_KEY, "true")` |
| 12 | AUTH-03 요건 - HeaderBar에 역할 인디케이터가 있다 | PARTIAL | `header-bar.tsx`는 breadcrumb + Cmd+K hint만 구현. 역할 인디케이터 없음. 검색 기능은 CommandPalette(AUTH-05)로 위임됨. 테마 토글은 사이드바 푸터에 있음. |

**Score:** 11/12 truths verified (1 partial gap)

---

## Required Artifacts

### Plan 02-01 Artifacts

| Artifact | Lines (min) | Actual Lines | Status | Key Details |
|----------|-------------|--------------|--------|-------------|
| `src/lib/auth.ts` | — | 16 | VERIFIED | Exports `AUTH_KEY`, `WELCOME_KEY`, `validatePassword` — 모두 확인 |
| `src/lib/navigation.ts` | — | 73 | VERIFIED | 4 groups, 6 items, `breadcrumbMap` 6 entries, `allNavItems` flat array — Node.js 직접 검증 |
| `src/hooks/use-auth.ts` | — | 34 | VERIFIED | `"use client"`, null/true/false tri-state, sessionStorage useEffect-guarded, login/logout |
| `src/app/login/page.tsx` | 50 | 75 | VERIFIED | split layout, useAuth hook, error state, FOUC prevention |
| `src/components/layout/login-graph.tsx` | 60 | 201 | VERIFIED | D3 forceSimulation (line 158), 6 nodes, 6 links, glow filter, ResizeObserver, cleanup |
| `src/app/(authenticated)/layout.tsx` | 20 | 50 | VERIFIED | auth guard + SidebarProvider + AppSidebar + HeaderBar + WelcomePopup + CommandPalette |
| `src/app/(authenticated)/page.tsx` | — | 9 | VERIFIED | stub "Ontology Dashboard" |
| `src/app/(authenticated)/monitoring/dgraph/page.tsx` | — | 9 | VERIFIED | stub "DGraph Monitoring" |
| `src/app/(authenticated)/monitoring/gpu/page.tsx` | — | 9 | VERIFIED | stub "GPU Monitoring" |
| `src/app/(authenticated)/workspace/studio/page.tsx` | — | 9 | VERIFIED | stub "Ontology Studio" |
| `src/app/(authenticated)/workspace/query/page.tsx` | — | 9 | VERIFIED | stub "Query Console" |
| `src/app/(authenticated)/admin/users/page.tsx` | — | 9 | VERIFIED | stub "User Management" |
| `src/app/page.tsx` | — | DELETED | VERIFIED | root page.tsx 삭제됨 — 라우트 충돌 없음 |

### Plan 02-02 Artifacts

| Artifact | Lines (min) | Actual Lines | Status | Key Details |
|----------|-------------|--------------|--------|-------------|
| `src/components/layout/app-sidebar.tsx` | 80 | 102 | VERIFIED | 4 nav groups, isActive, collapsible=icon, theme toggle (Switch), logout (useAuth) |
| `src/components/layout/header-bar.tsx` | 30 | 60 | VERIFIED (partial) | breadcrumb + SidebarTrigger + Cmd+K hint. 역할 인디케이터 없음 |
| `src/components/layout/welcome-popup.tsx` | 30 | 55 | VERIFIED | Korean dialog, sessionStorage dismissal, WELCOME_KEY import |
| `src/components/layout/command-palette.tsx` | 40 | 78 | VERIFIED | Cmd+K listener, 4 nav groups, theme toggle Actions group, `router.push` |

---

## Key Link Verification

### Plan 02-01 Key Links

| From | To | Via | Status | Detail |
|------|----|-----|--------|--------|
| `src/hooks/use-auth.ts` | `src/lib/auth.ts` | `import AUTH_KEY, WELCOME_KEY, validatePassword` | WIRED | Line 5: `import { AUTH_KEY, WELCOME_KEY, validatePassword } from "@/lib/auth"` |
| `src/app/login/page.tsx` | `src/hooks/use-auth.ts` | `useAuth()` hook for login() | WIRED | Line 5 import + Line 13 usage: `const { isAuthenticated, login } = useAuth()` |
| `src/app/(authenticated)/layout.tsx` | `src/hooks/use-auth.ts` | `useAuth()` for isAuthenticated check + redirect | WIRED | Line 5 import + Line 17 usage: `const { isAuthenticated } = useAuth()` |
| `src/components/layout/login-graph.tsx` | `d3` | D3 force simulation for decorative ontology graph | WIRED | Lines 158-172: `d3.forceSimulation(nodes).force(...).alphaTarget(0.02)` — note: pattern `d3\.forceSimulation` spans two lines in source but is clearly present |

### Plan 02-02 Key Links

| From | To | Via | Status | Detail |
|------|----|-----|--------|--------|
| `src/components/layout/app-sidebar.tsx` | `src/lib/navigation.ts` | `import navigationGroups` | WIRED | Line 23: `import { navigationGroups } from "@/lib/navigation"` |
| `src/components/layout/app-sidebar.tsx` | `src/hooks/use-auth.ts` | `useAuth().logout` | WIRED | Line 24 import + Line 29: `const { logout } = useAuth()` |
| `src/components/layout/header-bar.tsx` | `src/lib/navigation.ts` | `import breadcrumbMap` | WIRED | Line 15 import + Line 19: `const crumb = breadcrumbMap[pathname]` + Lines 30/34: rendered in JSX |
| `src/components/layout/command-palette.tsx` | `src/lib/navigation.ts` | `import navigationGroups or allNavItems` | WIRED | Line 16: `import { navigationGroups } from "@/lib/navigation"` + Lines 42-57: rendered in CommandGroup |
| `src/components/layout/welcome-popup.tsx` | `src/lib/auth.ts` | `import WELCOME_KEY` | WIRED | Line 14 import + Lines 21/28: used in sessionStorage.getItem/setItem |
| `src/app/(authenticated)/layout.tsx` | `src/components/layout/app-sidebar.tsx` | `SidebarProvider wrapping AppSidebar` | WIRED | Line 7 import + Line 41: `<AppSidebar />` inside `<SidebarProvider>` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AUTH-01 | 02-01 | Password Gate (세션 기반, configurable 비밀번호) | SATISFIED | `lib/auth.ts` + `hooks/use-auth.ts` + `login/page.tsx` + `(authenticated)/layout.tsx` 모두 구현 완료. `NEXT_PUBLIC_SITE_PASSWORD` env var configurable (defaults to "exem123") |
| AUTH-02 | 02-02 | AppSidebar (4그룹 네비게이션: Operations/Monitoring/Workspace/Administration) | SATISFIED | `app-sidebar.tsx`: 4 nav groups verified via `navigationGroups` mapping |
| AUTH-03 | 02-02 | HeaderBar (브레드크럼, 검색, 테마 토글, 역할 인디케이터) | PARTIAL | 브레드크럼: DONE. 검색: CommandPalette로 위임 (Cmd+K hint로 연결). 테마 토글: 사이드바 푸터로 이전. **역할 인디케이터: 미구현 — 코드베이스 어디에도 없음** |
| AUTH-04 | 02-02 | Welcome Popup (첫 방문 한국어 안내, localStorage 기반) | SATISFIED | `welcome-popup.tsx` 구현됨. 참고: REQUIREMENTS.md는 "localStorage 기반"이라고 했으나 구현은 sessionStorage 사용 (플랜 결정). 기능상 요건(첫 방문 팝업, 한국어, 닫기) 충족 |
| AUTH-05 | 02-02 | Command Palette (Cmd+K 검색/네비게이션) | SATISFIED | `command-palette.tsx`: Cmd+K 키보드 단축키, 4 nav groups 검색, 테마 토글 Actions |
| AUTH-06 | 02-01 | 라우팅 6개 페이지 (/, /monitoring/dgraph, /monitoring/gpu, /workspace/studio, /workspace/query, /admin/users) | SATISFIED | 6개 파일 모두 존재. `(authenticated)` 라우트 그룹 내 올바른 경로 |

**Requirements Coverage: 5/6 SATISFIED, 1/6 PARTIAL (AUTH-03 역할 인디케이터 미구현)**

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/app/login/page.tsx` | 54 | `placeholder="비밀번호"` | INFO | HTML input placeholder attribute — 스텁 코드 아님, 정상 |
| `src/components/layout/command-palette.tsx` | 37 | `placeholder="페이지 검색..."` | INFO | HTML input placeholder attribute — 스텁 코드 아님, 정상 |

스텁/미구현/TODO 안티패턴 없음. 6개 페이지 스텁은 Phase 2 설계에서 의도된 것으로 Phase 3-7에서 교체 예정.

---

## Human Verification Required

### 1. 사이드바 접기/펼치기 동작

**Test:** 로그인 후 사이드바 상단 토글 버튼 클릭
**Expected:** 사이드바가 아이콘 전용 모드로 전환 (텍스트 숨김, 아이콘만 표시), 로고가 "eX"로 축소, 테마 스위치는 숨겨지고 아이콘만 남음
**Why human:** Shadcn `SidebarProvider`의 `collapsible="icon"` 동작은 실제 브라우저 렌더링과 CSS animation이 필요

### 2. D3 Force Graph 시각적 동작

**Test:** `/login` 접근 후 우측 패널 D3 그래프 관찰
**Expected:** 6개 노드(Equipment/Process/Wafer/Recipe/Defect/MaintenanceRecord)가 링크로 연결되어 부드럽게 연속 drift 애니메이션. 글로우 효과 표시
**Why human:** D3 `alphaTarget(0.02)` 연속 애니메이션, SVG glow filter 렌더링은 브라우저 환경 의존

### 3. Welcome Popup 재등장 사이클

**Test:** 로그인 -> 팝업 닫기 -> 로그아웃 -> 재로그인
**Expected:** 로그아웃 시 `WELCOME_KEY`가 sessionStorage에서 제거됨 -> 재로그인 후 팝업 다시 등장
**Why human:** sessionStorage 클리어 (`logout()` in `use-auth.ts` L28) -> WelcomePopup mount 사이클은 브라우저 세션 상태 의존

---

## Gaps Summary

**1개 갭: AUTH-03 역할 인디케이터 (role indicator) 미구현**

`REQUIREMENTS.md`는 AUTH-03을 "HeaderBar (브레드크럼, 검색, 테마 토글, 역할 인디케이터)"로 정의한다. 구현된 `header-bar.tsx`는 breadcrumb + sidebar trigger + Cmd+K hint만 포함한다. 역할 인디케이터는 코드베이스 어디에도 없다.

**맥락:**
- Plan 02-02의 HeaderBar 스펙은 역할 인디케이터를 명시하지 않았다 (브레드크럼 + Cmd+K hint로만 범위 지정)
- 검색 기능은 CommandPalette(AUTH-05)로, 테마 토글은 사이드바 푸터(AUTH-02)로 위임됨
- 역할 시스템 자체(RBAC)는 Phase 7에서 구현 예정 — 역할 인디케이터를 Phase 2에서 구현하려면 임시 mock 역할 표시가 필요했을 것

**권고:** 다음 두 중 하나를 선택:
1. REQUIREMENTS.md에서 AUTH-03의 "역할 인디케이터" 항목을 Phase 7로 이전 (RBAC과 함께 구현)
2. `header-bar.tsx`에 mock 역할 배지 추가 (e.g., `<span>admin</span>` 정도의 placeholder)

**Phase Goal 전반 달성도:** 핵심 골("비밀번호로 진입 + 6개 페이지 사이드바 탐색")은 완전히 달성됨. AUTH-03 역할 인디케이터 갭은 Phase Goal에 직접 영향을 미치지 않으며 REQUIREMENTS.md 항목 추적 상의 미완성임.

---

## Note on AUTH-04 Implementation Choice

`REQUIREMENTS.md`는 AUTH-04를 "localStorage 기반"으로 명시했으나 `welcome-popup.tsx`는 `sessionStorage`를 사용한다. 이는 Plan 02-02의 명시적 설계 결정 (로그아웃 시 팝업 재등장을 위해 sessionStorage 선택)이며, `use-auth.ts`의 `logout()` 함수에서 `WELCOME_KEY`를 sessionStorage에서 제거하는 로직과 일관성을 갖는다. 기능 요건(첫 방문 팝업, 한국어, 닫기)은 충족된다. REQUIREMENTS.md 업데이트를 권고한다: "sessionStorage 기반 (세션 종료 시 리셋)".

---

_Verified: 2026-02-19T08:41:33Z_
_Verifier: Claude (gsd-verifier)_
