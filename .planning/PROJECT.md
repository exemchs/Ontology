# eXemble Ontology Platform — SK Siltron Semiconductor FAB POC

## What This Is

엑셈의 eXemble Ontology Platform. 반도체 FAB 환경을 위한 Dgraph 그래프 데이터베이스 시각화 및 관리 솔루션 프로토타입. 그래프 클러스터 헬스, 온톨로지 스키마 관리, 쿼리 실행(역할별 데이터 마스킹 시뮬레이션), GPU 모니터링을 D3.js 기반 인터랙티브 대시보드로 제공한다. SK실트론 제안용 워킹 프로토타입.

## Core Value

반도체 FAB의 그래프 데이터베이스 운영, 온톨로지 관계, 컴퓨트 인프라를 하나의 통합 대시보드에서 D3.js 시각화로 직관적으로 보여주고, RBAC 기반 PII 데이터 거버넌스를 시연할 수 있어야 한다.

## Requirements

### Validated

- ✓ Next.js 16 App Router 기반 웹 애플리케이션 — existing
- ✓ Supabase 인증 및 세션 관리 (클라이언트/서버/미들웨어) — existing
- ✓ Tailwind CSS 4 스타일링 시스템 — existing
- ✓ Vercel 배포 파이프라인 — existing
- ✓ TypeScript strict mode 타입 안전성 — existing

### Active

<!-- 6개 페이지 + 19개 D3 차트 + RBAC/PII 시스템 -->

**인증 & 레이아웃:**
- [ ] Password Gate (세션 기반 간단 인증, 비밀번호: configurable)
- [ ] AppSidebar (Operations/Monitoring/Workspace/Administration 4그룹 네비게이션)
- [ ] HeaderBar (브레드크럼, 검색, 테마 토글, 역할 인디케이터)
- [ ] Welcome Popup (첫 방문 한국어 안내)
- [ ] Command Palette (Cmd+K 검색/네비게이션)
- [ ] 다크/라이트 테마 시스템

**Page 1 — Ontology Dashboard (`/`):**
- [ ] 메트릭 카드 4종 (총 노드, 관계, 쿼리율, 가동시간)
- [ ] D3 리소스 게이지 3종 (CPU/Memory/Disk — 270° 아크)
- [ ] D3 듀얼 라인 차트 (Agent Request Rate + Graph Query QPS)
- [ ] D3 코드 다이어그램 (6개 온톨로지 타입 간 관계)
- [ ] D3 노드 산점도 (Latency × Throughput)
- [ ] D3 리소스 바 차트 (Stacked/Grouped 토글)
- [ ] Recent Alerts 목록

**Page 2 — DGraph Monitoring (`/monitoring/dgraph`):**
- [ ] D3 클러스터 토폴로지 (Force/Radial 레이아웃, 노드 드래그, 줌/팬, 데이터 흐름 파티클 애니메이션)
- [ ] 노드 상세 패널 (클릭 시 QPS/CPU/Memory 표시)
- [ ] D3 쿼리 산점도 (Brushable — 영역 선택으로 쿼리 필터링)
- [ ] D3 샤드 바 차트 (Grouped bar)
- [ ] Recent Events 목록

**Page 3 — GPU Monitoring (`/monitoring/gpu`):**
- [ ] GPU 카드 4장 (A100 80GB×2 + A100 40GB×2)
- [ ] D3 성능 트렌드 멀티라인 (Utilization/Temperature/Power/Memory 탭)
- [ ] D3 히트맵 (GPU × Time)
- [ ] D3 리즈라인 차트 (밀도 패턴 비교)
- [ ] D3 GPU 비교 바 차트

**Page 4 — Ontology Studio (`/workspace/studio`):**
- [ ] 타입 리스트 (6개: Equipment/Process/Wafer/Recipe/Defect/MaintenanceRecord)
- [ ] 타입 상세 패널 (Predicates, Relations)
- [ ] D3 온톨로지 그래프 (Force/Radial/Hierarchy 3모드, 양방향 엣지, 줌/팬)
- [ ] D3 타입 분포 바 차트 (Records/Queries, Stacked/Grouped)
- [ ] 타입 편집 다이얼로그

**Page 5 — Query Console (`/workspace/query`):**
- [ ] 쿼리 에디터 (라인 넘버, GraphQL/DQL 모드 토글)
- [ ] 템플릿 셀렉터 + 쿼리 히스토리
- [ ] 멀티탭 결과 (최대 5탭, 실행시간 배지)
- [ ] 6종 결과 뷰 (Table/Graph/Treemap/Arc Diagram/Scatter/Distribution)
- [ ] RBAC PII 마스킹 시뮬레이터 (Role selector → 실시간 마스킹 변환)
- [ ] PII 데모 탭 2종 (FAB Equipment + General PII)
- [ ] PII 테이블 (마스킹 셀 배경색 + 아이콘, 컬럼 PII 등급 배지)
- [ ] 역할별 Info Banner (권한 요약)

**Page 6 — User Management (`/admin/users`):**
- [ ] 유저 테이블 (username, email, role badge, last login)
- [ ] 4종 역할 배지 (Super Admin/Service App/Data Analyst/Auditor)
- [ ] 역할 설명 Tooltip

**데이터 레이어:**
- [ ] Supabase 스키마 (clusters/nodes/gpus/metrics/ontology_types/queries/alerts/users)
- [ ] 시드 데이터 (SKS-FAB1-PROD 클러스터, 12노드, 4GPU, 6 온톨로지 타입, 5 유저)
- [ ] 클라이언트사이드 하드코딩 데이터 (대시보드/DGraph/GPU/Studio/Query 메트릭)
- [ ] PII 데모 데이터 (FAB 8행 + General 5행)

**RBAC 시스템:**
- [ ] 4역할 정의 (super_admin/service_app/data_analyst/auditor)
- [ ] PII 마스킹 함수 (maskName/maskPhone/maskEmail/maskId/maskAddress)
- [ ] 역할별 필드 마스킹 규칙 (Plain/Masked/Anonymized/Denied)

### Out of Scope

- Dgraph ACL 실제 연동 — POC는 시뮬레이션만 (향후 과제)
- PostgreSQL 컬럼 수준 REVOKE/GRANT — POC 범위 외
- 감사 로그 — PII 접근 기록 저장 미구현
- LLM/AI 기반 자동 분석 — 향후 확장 가능
- 실시간 데이터 연동 — 하드코딩 + 시드 데이터 기반
- 모바일 앱 — 웹 데모 우선
- 스크린리더 상세 대응 — POC 범위 외

## Context

- **클라이언트:** SK실트론 — 반도체 웨이퍼 제조 FAB
- **제품명:** eXemble Ontology Platform
- **목적:** SK실트론 제안 단계 워킹 프로토타입 (POC)
- **도메인:** 반도체 FAB (300mm 실리콘 웨이퍼)
  - 클러스터: SKS-FAB1-PROD
  - 장비 타입: CVD, Etcher, Furnace, CMP, Lithography, Inspection, Implanter, Metrology
  - 제조사: ASML, Applied Materials, Tokyo Electron, KLA, Lam Research
  - 위치: FAB1-BAY02 ~ BAY11
- **온톨로지 타입 6종:** Equipment(847), Process(24,680), Wafer(156,200), Recipe(312), Defect(48,920), MaintenanceRecord(3,840)
- **데이터 아키텍처:** API 기반(Supabase — users, queries) + 클라이언트 하드코딩(대시보드/모니터링 메트릭)
- **시각화:** D3.js v7.9.0 — 총 19개 차트 컴포넌트
- **UI 컴포넌트:** shadcn/ui 17종 (button, input, card, badge, dialog, tabs, table, select, tooltip, sidebar, command, scroll-area, separator, dropdown-menu, breadcrumb, collapsible, switch, textarea, toaster)
- **PRD 참조:** `/Users/chs/Downloads/exemble-ontology-docs-v1.3/` (01_PRD, 02_Data-Schema, 03_D3-Visualization-Spec, 04_Implementation-Guide)

## Constraints

- **Tech stack**: Next.js 16 + Supabase + Tailwind CSS 4 (PRD의 Vite+Express+PostgreSQL 대신 기존 스택 유지)
- **시각화**: D3.js v7.9.0 (PRD 명세 그대로)
- **UI**: shadcn/ui + Tailwind (PRD 명세 적용)
- **성능**: D3 차트 렌더 < 200ms, force sim 안정화 < 3s
- **브라우저**: Chrome, Firefox, Edge, Safari
- **배포**: Vercel (https://ontology-eta.vercel.app)
- **데이터**: 하드코딩 + Supabase 시드 (실제 SK실트론 데이터 없음)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js + Supabase 유지 (PRD의 Vite+Express+PostgreSQL 대신) | 기존 인프라 활용, 재구축 비용 절감 | ✓ Good |
| D3.js v7.9.0 사용 | PRD 명세 준수, 인터랙티브 시각화 요구사항 충족 | — Pending |
| 대부분 데이터 하드코딩 | POC 특성상 빠른 시연이 우선, API 연동은 users/queries만 | — Pending |
| RBAC 클라이언트사이드 시뮬레이션 | Dgraph ACL 실연동 없이 역할별 마스킹 데모 가능 | — Pending |
| shadcn/ui 컴포넌트 시스템 | 일관된 UI, 빠른 개발, 다크/라이트 테마 지원 | — Pending |

---
*Last updated: 2026-02-19 after PRD v1.3 반영*
