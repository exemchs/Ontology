# Requirements: eXemble Ontology Platform

**Defined:** 2026-02-19
**Core Value:** 반도체 FAB의 그래프 DB 운영, 온톨로지 관계, 인프라를 통합 대시보드에서 D3.js로 시각화하고, RBAC 기반 PII 데이터 거버넌스를 시연한다.

## v1 Requirements

### Foundation

- [x] **FOUN-01**: 프로젝트에 D3.js v7 + shadcn/ui 17종 설치 및 초기화
- [x] **FOUN-02**: exem-ui CSS 토큰 시스템 구축 (primitive + semantic + chart series 8색)
- [x] **FOUN-03**: 다크/라이트 테마 시스템 (ThemeProvider, CSS variables)
- [x] **FOUN-04**: TypeScript 타입 정의 (Role, PiiLevel, OntologyType, ClusterNode 등)
- [x] **FOUN-05**: D3 차트 공통 유틸리티 (cleanupD3Svg, destroyedRef, ResizeObserver 패턴)
- [x] **FOUN-06**: D3 차트 테마 유틸리티 (CSS variable 기반 색상 resolve)
- [x] **FOUN-07**: D3 Tooltip 공통 컴포넌트

### Authentication & Layout

- [x] **AUTH-01**: Password Gate (세션 기반, configurable 비밀번호)
- [x] **AUTH-02**: AppSidebar (4그룹 네비게이션: Operations/Monitoring/Workspace/Administration)
- [x] **AUTH-03**: HeaderBar (브레드크럼, 검색 연동, Cmd+K 힌트) — 역할 인디케이터는 RBAC-09로 Phase 7 이전
- [x] **AUTH-04**: Welcome Popup (첫 방문 한국어 안내, sessionStorage 기반 — 로그아웃 시 리셋)
- [x] **AUTH-05**: Command Palette (Cmd+K 검색/네비게이션)
- [x] **AUTH-06**: 라우팅 6개 페이지 (/, /monitoring/dgraph, /monitoring/gpu, /workspace/studio, /workspace/query, /admin/users)

### Ontology Dashboard

- [x] **DASH-01**: 메트릭 카드 4종 (총 노드, 관계, 쿼리율, 가동시간)
- [x] **DASH-02**: D3 리소스 게이지 3종 (CPU/Memory/Disk — 270도 아크, 80% 임계 글로우)
- [x] **DASH-03**: D3 듀얼 라인 차트 (Agent Request Rate + Graph Query QPS, hourly/daily 토글)
- [x] **DASH-04**: D3 코드 다이어그램 (6개 온톨로지 타입 간 관계, 호버 하이라이트)
- [x] **DASH-05**: D3 노드 산점도 (Latency x Throughput, 글로우 효과)
- [x] **DASH-06**: D3 리소스 바 차트 (Stacked/Grouped 토글, CPU/Memory/Disk)
- [x] **DASH-07**: Recent Alerts 목록

### DGraph Monitoring

- [ ] **DGRP-01**: D3 클러스터 토폴로지 (Force/Radial 레이아웃, 노드 드래그, 줌/팬)
- [ ] **DGRP-02**: 데이터 흐름 파티클 애니메이션 (연결선 위 이동)
- [ ] **DGRP-03**: 노드 상태 링 (healthy/warning/error 색상 + 펄스 애니메이션)
- [ ] **DGRP-04**: 노드 상세 패널 (클릭 시 QPS/CPU/Memory 표시)
- [x] **DGRP-05**: D3 쿼리 산점도 (Brushable — 영역 선택으로 쿼리 필터링)
- [x] **DGRP-06**: D3 샤드 바 차트 (Grouped bar)
- [ ] **DGRP-07**: Recent Events 목록

### GPU Monitoring

- [ ] **GPU-01**: GPU 서머리 헤더 (총 GPU 수, 평균 사용률)
- [ ] **GPU-02**: GPU 카드 4장 (A100 80GB x 2 + A100 40GB x 2, 상태/온도/사용률)
- [ ] **GPU-03**: D3 성능 트렌드 멀티라인 (Utilization/Temperature/Power/Memory 탭, 범례 토글)
- [ ] **GPU-04**: D3 히트맵 (GPU x Time, sequential color scale)
- [ ] **GPU-05**: D3 리즈라인 차트 (4 GPU 밀도 패턴 비교, 수직 오프셋)
- [ ] **GPU-06**: D3 GPU 비교 바 차트 (Grouped bars, 4 GPU 나란히)
- [ ] **GPU-07**: Health Issues 목록 + Processes 테이블

### Ontology Studio

- [ ] **STUD-01**: 타입 리스트 (6개: Equipment/Process/Wafer/Recipe/Defect/MaintenanceRecord)
- [ ] **STUD-02**: 타입 상세 패널 (Predicates, Relations, Statistics)
- [ ] **STUD-03**: D3 온톨로지 그래프 (Force/Radial/Hierarchy 3모드, 양방향 엣지, 줌/팬)
- [ ] **STUD-04**: D3 타입 분포 바 차트 (Records/Queries, Stacked/Grouped 토글)
- [ ] **STUD-05**: 타입 편집 다이얼로그 + 엣지 필터 (all/outbound/inbound)

### Query Console

- [ ] **QURY-01**: 쿼리 에디터 (라인 넘버, GraphQL/DQL 모드 토글)
- [ ] **QURY-02**: 템플릿 셀렉터 + 저장된 쿼리 목록
- [ ] **QURY-03**: 쿼리 히스토리 (Supabase API 기반)
- [ ] **QURY-04**: 멀티탭 결과 (최대 5탭, 실행시간 배지)
- [ ] **QURY-05**: D3 Force Graph (Bipartite 장비-위치 그래프)
- [ ] **QURY-06**: D3 Treemap (장비 타입별 그룹)
- [ ] **QURY-07**: D3 Arc Diagram (Equipment -> Bay 연결)
- [ ] **QURY-08**: D3 Query Scatter (Location x Complexity, Brush 선택)
- [ ] **QURY-09**: D3 Query Distribution (Location x Type, Stacked/Grouped)
- [ ] **QURY-10**: Table View (결과 테이블)

### RBAC & PII Masking

- [ ] **RBAC-01**: 4역할 정의 (super_admin/service_app/data_analyst/auditor)
- [ ] **RBAC-02**: PII 마스킹 함수 (maskName/maskPhone/maskEmail/maskId/maskAddress/maskResidentId)
- [ ] **RBAC-03**: 역할별 필드 마스킹 규칙 설정 (Plain/Masked/Anonymized/Denied)
- [ ] **RBAC-04**: Role Selector (Query Console 내 Select 드롭다운)
- [ ] **RBAC-05**: PII 데모 탭 2종 (FAB Equipment 8행 + General PII 5행)
- [ ] **RBAC-06**: PII 테이블 (마스킹 셀 배경색 bg-amber/bg-red + 아이콘)
- [ ] **RBAC-07**: 컬럼 헤더 PII 등급 배지 (높음/중간/없음)
- [ ] **RBAC-08**: 역할별 Info Banner (권한 요약 메시지)
- [ ] **RBAC-09**: HeaderBar 역할 인디케이터 (현재 역할 배지 표시 — AUTH-03에서 이전)

### User Management

- [ ] **USER-01**: 유저 테이블 (username, email, role badge, last login — Supabase API)
- [ ] **USER-02**: 4종 역할 배지 (color-coded: red/blue/gray/outline)
- [ ] **USER-03**: 역할 설명 Tooltip (PII 접근 권한 요약)

### Data Layer

- [x] **DATA-01**: Supabase 스키마 (clusters/nodes/gpus/metrics/ontology_types/queries/alerts/users 8테이블)
- [x] **DATA-02**: 시드 데이터 (SKS-FAB1-PROD, 12노드, 4GPU, 6 온톨로지 타입, 5 유저)
- [x] **DATA-03**: 클라이언트 하드코딩 데이터 (dashboard/dgraph/gpu/studio/query 메트릭)
- [x] **DATA-04**: PII 데모 데이터 (FAB + General 시나리오)

### Polish & UX

- [x] **UX-01**: D3 차트 로딩 상태 (스켈레톤 또는 스피너)
- [x] **UX-02**: D3 차트 빈 상태 (데이터 없을 때 메시지)
- [x] **UX-03**: data-testid 속성 (인터랙티브 요소)

## v2 Requirements

### AI Integration

- **AI-01**: LLM 기반 자연어 쿼리 (GraphQL/DQL 자동 생성)
- **AI-02**: 이상 탐지 자동 알림 (불량 패턴 AI 분석)

### Dgraph ACL Integration

- **ACL-01**: 실제 Dgraph ACL 연동 (PII Predicate 권한 제어)
- **ACL-02**: PostgreSQL 컬럼 수준 REVOKE/GRANT
- **ACL-03**: 마스킹 View 자동 생성

### Audit & Compliance

- **AUDT-01**: PII 접근 감사 로그
- **AUDT-02**: 역할별 접근 기록 대시보드

### Real-time

- **RT-01**: 실시간 메트릭 스트리밍 (WebSocket)
- **RT-02**: 라이브 알림 시스템

## Out of Scope

| Feature | Reason |
|---------|--------|
| 실시간 데이터 연동 | POC는 하드코딩/시드 데이터 기반 |
| 모바일 앱 | 웹 데모 우선 |
| 커스텀 대시보드 빌더 | 고정 레이아웃으로 충분 |
| 알림 규칙 엔진 | POC 범위 초과 |
| 데이터 Export (CSV/JSON) | 시연에 불필요 |
| i18n (다국어) | 한국어 UI + 영어 기술용어 혼용으로 충분 |
| 플러그인 시스템 | POC 범위 초과 |
| 스크린리더 상세 대응 | POC 범위 외 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-02 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-03 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-04 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-05 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-06 | Phase 1: Foundation & Data Layer | Complete |
| FOUN-07 | Phase 1: Foundation & Data Layer | Complete |
| AUTH-01 | Phase 2: Layout Shell | Complete |
| AUTH-02 | Phase 2: Layout Shell | Complete |
| AUTH-03 | Phase 2: Layout Shell | Complete |
| AUTH-04 | Phase 2: Layout Shell | Complete |
| AUTH-05 | Phase 2: Layout Shell | Complete |
| AUTH-06 | Phase 2: Layout Shell | Complete |
| DASH-01 | Phase 3: Ontology Dashboard | Complete |
| DASH-02 | Phase 3: Ontology Dashboard | Complete |
| DASH-03 | Phase 3: Ontology Dashboard | Complete |
| DASH-04 | Phase 3: Ontology Dashboard | Complete |
| DASH-05 | Phase 3: Ontology Dashboard | Complete |
| DASH-06 | Phase 3: Ontology Dashboard | Complete |
| DASH-07 | Phase 3: Ontology Dashboard | Complete |
| DGRP-01 | Phase 4: DGraph Monitoring | Pending |
| DGRP-02 | Phase 4: DGraph Monitoring | Pending |
| DGRP-03 | Phase 4: DGraph Monitoring | Pending |
| DGRP-04 | Phase 4: DGraph Monitoring | Pending |
| DGRP-05 | Phase 4: DGraph Monitoring | Complete |
| DGRP-06 | Phase 4: DGraph Monitoring | Complete |
| DGRP-07 | Phase 4: DGraph Monitoring | Pending |
| GPU-01 | Phase 5: GPU Monitoring | Pending |
| GPU-02 | Phase 5: GPU Monitoring | Pending |
| GPU-03 | Phase 5: GPU Monitoring | Pending |
| GPU-04 | Phase 5: GPU Monitoring | Pending |
| GPU-05 | Phase 5: GPU Monitoring | Pending |
| GPU-06 | Phase 5: GPU Monitoring | Pending |
| GPU-07 | Phase 5: GPU Monitoring | Pending |
| STUD-01 | Phase 6: Ontology Studio & User Management | Pending |
| STUD-02 | Phase 6: Ontology Studio & User Management | Pending |
| STUD-03 | Phase 6: Ontology Studio & User Management | Pending |
| STUD-04 | Phase 6: Ontology Studio & User Management | Pending |
| STUD-05 | Phase 6: Ontology Studio & User Management | Pending |
| USER-01 | Phase 6: Ontology Studio & User Management | Pending |
| USER-02 | Phase 6: Ontology Studio & User Management | Pending |
| USER-03 | Phase 6: Ontology Studio & User Management | Pending |
| QURY-01 | Phase 7: Query Console & RBAC | Pending |
| QURY-02 | Phase 7: Query Console & RBAC | Pending |
| QURY-03 | Phase 7: Query Console & RBAC | Pending |
| QURY-04 | Phase 7: Query Console & RBAC | Pending |
| QURY-05 | Phase 7: Query Console & RBAC | Pending |
| QURY-06 | Phase 7: Query Console & RBAC | Pending |
| QURY-07 | Phase 7: Query Console & RBAC | Pending |
| QURY-08 | Phase 7: Query Console & RBAC | Pending |
| QURY-09 | Phase 7: Query Console & RBAC | Pending |
| QURY-10 | Phase 7: Query Console & RBAC | Pending |
| RBAC-01 | Phase 7: Query Console & RBAC | Pending |
| RBAC-02 | Phase 7: Query Console & RBAC | Pending |
| RBAC-03 | Phase 7: Query Console & RBAC | Pending |
| RBAC-04 | Phase 7: Query Console & RBAC | Pending |
| RBAC-05 | Phase 7: Query Console & RBAC | Pending |
| RBAC-06 | Phase 7: Query Console & RBAC | Pending |
| RBAC-07 | Phase 7: Query Console & RBAC | Pending |
| RBAC-08 | Phase 7: Query Console & RBAC | Pending |
| DATA-01 | Phase 1: Foundation & Data Layer | Complete |
| DATA-02 | Phase 1: Foundation & Data Layer | Complete |
| DATA-03 | Phase 1: Foundation & Data Layer | Complete |
| DATA-04 | Phase 1: Foundation & Data Layer | Complete |
| UX-01 | Phase 1: Foundation & Data Layer | Complete |
| UX-02 | Phase 1: Foundation & Data Layer | Complete |
| UX-03 | Phase 1: Foundation & Data Layer | Complete |

**Coverage:**
- v1 requirements: 67 total
- Mapped to phases: 67
- Unmapped: 0

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after roadmap creation (traceability updated)*
