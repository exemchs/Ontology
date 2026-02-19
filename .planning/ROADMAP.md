# Roadmap: eXemble Ontology Platform

## Overview

SK Siltron FAB POC를 위한 eXemble Ontology Platform 구축. 기존 Next.js 16 + Supabase 인프라 위에 D3.js v7 시각화 19종과 shadcn/ui 기반 6개 페이지를 올린다. Foundation (CSS토큰 + D3유틸 + 데이터레이어) -> Layout Shell -> Dashboard (차트패턴 검증) -> DGraph (최고위험 force sim) -> 나머지 페이지 순서로 진행. Query Console + RBAC PII 마스킹이 킬러 데모 피처.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Data Layer** - CSS토큰, D3유틸, 타입, 데이터 스키마/시드, UX기반
- [ ] **Phase 2: Layout Shell** - PasswordGate, Sidebar, Header, CommandPalette, 라우팅
- [ ] **Phase 3: Ontology Dashboard** - 대시보드 7종 D3차트 + 메트릭카드 (차트패턴 검증)
- [ ] **Phase 4: DGraph Monitoring** - Force토폴로지, 파티클, 드래그/줌, 산점도, 샤드차트
- [ ] **Phase 5: GPU Monitoring** - GPU카드, 멀티라인, 히트맵, 리즈라인, 비교차트
- [ ] **Phase 6: Ontology Studio & User Management** - 온톨로지그래프 3모드, 타입관리, 유저테이블
- [ ] **Phase 7: Query Console & RBAC** - 쿼리에디터, 6종결과뷰, PII마스킹시뮬레이터, RBAC

## Phase Details

### Phase 1: Foundation & Data Layer
**Goal**: D3 차트 개발과 페이지 구축에 필요한 모든 인프라가 검증되고 준비된 상태
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07, DATA-01, DATA-02, DATA-03, DATA-04, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. shadcn/ui 17종 컴포넌트가 설치되고 Tailwind CSS 4와 정상 동작한다
  2. 다크/라이트 테마를 토글하면 전체 UI와 D3 차트 색상이 즉시 전환된다
  3. D3 테스트 차트가 ResizeObserver로 반응형 리사이즈되고 언마운트 시 메모리 누수 없이 정리된다
  4. Supabase 8개 테이블에 시드 데이터가 존재하고 클라이언트에서 조회 가능하다
  5. 하드코딩 데이터 파일(dashboard/dgraph/gpu/studio/query)이 TypeScript 타입과 함께 임포트 가능하다
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — shadcn/ui + D3 설치, exem-ui CSS 토큰 시스템, 다크/라이트 테마
- [ ] 01-02-PLAN.md — TypeScript 도메인 타입 정의, Supabase 스키마 + 시드 데이터
- [ ] 01-03-PLAN.md — D3 차트 유틸리티 3종, 로딩/빈 상태 UX 컴포넌트
- [ ] 01-04-PLAN.md — 클라이언트 데이터 파일 5종, PII 마스킹 시스템

### Phase 2: Layout Shell
**Goal**: 사용자가 비밀번호로 진입하여 6개 페이지를 사이드바로 탐색할 수 있는 완전한 앱 셸
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06
**Success Criteria** (what must be TRUE):
  1. 비밀번호 입력 없이는 어떤 페이지에도 접근할 수 없고 올바른 비밀번호 입력 후 대시보드로 진입한다
  2. 사이드바에서 6개 페이지를 모두 클릭하여 이동할 수 있고 현재 페이지가 하이라이트된다
  3. Cmd+K로 Command Palette가 열리고 페이지 검색/이동이 동작한다
  4. 첫 방문 시 Welcome Popup이 한국어로 표시되고 닫으면 다시 나타나지 않는다
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Auth 인프라 + Password Gate (D3 그래프) + 라우팅 스켈레톤 6페이지
- [ ] 02-02-PLAN.md — AppSidebar + HeaderBar + Welcome Popup + Command Palette

### Phase 3: Ontology Dashboard
**Goal**: 랜딩 페이지에서 클러스터 상태, 리소스, 쿼리 트렌드, 온톨로지 관계를 한눈에 파악할 수 있다
**Depends on**: Phase 2
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07
**Success Criteria** (what must be TRUE):
  1. 메트릭 카드 4종(노드/관계/쿼리율/가동시간)이 숫자와 트렌드 아이콘으로 표시된다
  2. CPU/Memory/Disk 게이지가 270도 아크로 렌더되고 80% 이상일 때 글로우 효과가 나타난다
  3. 듀얼 라인 차트에서 hourly/daily 토글이 동작하고 D3 코드 다이어그램에서 호버 시 관계가 하이라이트된다
  4. 모든 D3 차트가 200ms 이내에 렌더되고 다크/라이트 테마 전환에 반응한다
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: DGraph Monitoring
**Goal**: 12노드 Dgraph 클러스터의 토폴로지, 노드 상태, 쿼리 패턴, 샤드 분포를 인터랙티브하게 탐색할 수 있다
**Depends on**: Phase 2
**Requirements**: DGRP-01, DGRP-02, DGRP-03, DGRP-04, DGRP-05, DGRP-06, DGRP-07
**Success Criteria** (what must be TRUE):
  1. 클러스터 토폴로지가 Force/Radial 레이아웃으로 전환되고 노드를 드래그하고 줌/팬할 수 있다
  2. 데이터 흐름 파티클이 연결선 위를 이동하고 노드 상태(healthy/warning/error)에 따라 링 색상과 펄스 애니메이션이 표시된다
  3. 노드를 클릭하면 상세 패널에 QPS/CPU/Memory 정보가 나타난다
  4. 쿼리 산점도에서 영역을 브러시 선택하면 해당 쿼리만 필터링된다
  5. Force simulation이 3초 이내에 안정화된다
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: GPU Monitoring
**Goal**: 4개 A100 GPU의 상태, 성능 트렌드, 활용 패턴을 실시간 모니터링 UI로 확인할 수 있다
**Depends on**: Phase 2
**Requirements**: GPU-01, GPU-02, GPU-03, GPU-04, GPU-05, GPU-06, GPU-07
**Success Criteria** (what must be TRUE):
  1. GPU 서머리 헤더에 총 GPU 수와 평균 사용률이 표시되고 4개 GPU 카드에 모델/온도/사용률이 나타난다
  2. 성능 트렌드 멀티라인 차트에서 Utilization/Temperature/Power/Memory 탭 전환과 범례 토글이 동작한다
  3. 히트맵에서 GPU x Time 매트릭스가 sequential color scale로 렌더되고 호버 시 상세 값이 보인다
  4. 리즈라인 차트에서 4개 GPU의 밀도 패턴이 수직 오프셋으로 비교되고 비교 바 차트에서 4 GPU가 나란히 표시된다
**Plans**: 3 plans

Plans:
- [ ] 05-01-PLAN.md — 데이터 레이어 확장 + 페이지 레이아웃 + React 컴포넌트 (서머리, GPU 카드, 이슈/프로세스 테이블)
- [ ] 05-02-PLAN.md — D3 멀티라인 성능 트렌드 차트 + D3 비교 바 차트
- [ ] 05-03-PLAN.md — D3 히트맵 + D3 리즈라인 차트 (토글 전환)

### Phase 6: Ontology Studio & User Management
**Goal**: 6개 온톨로지 타입의 스키마를 시각적으로 탐색/편집하고 시스템 사용자 역할을 관리할 수 있다
**Depends on**: Phase 2
**Requirements**: STUD-01, STUD-02, STUD-03, STUD-04, STUD-05, USER-01, USER-02, USER-03
**Success Criteria** (what must be TRUE):
  1. 타입 리스트에서 6개 온톨로지 타입을 선택하면 Predicates/Relations/Statistics가 상세 패널에 표시된다
  2. D3 온톨로지 그래프가 Force/Radial/Hierarchy 3모드로 전환되고 양방향 엣지와 줌/팬이 동작한다
  3. 타입 편집 다이얼로그에서 속성을 수정할 수 있고 엣지 필터(all/outbound/inbound)가 그래프에 반영된다
  4. 유저 테이블에 username/email/role/last login이 표시되고 4종 역할 배지가 색상 코딩되며 Tooltip에 권한 요약이 나타난다
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

### Phase 7: Query Console & RBAC
**Goal**: GraphQL/DQL 쿼리를 실행하고 6종 시각화로 결과를 확인하며 역할별 PII 마스킹을 실시간 시연할 수 있다
**Depends on**: Phase 2
**Requirements**: QURY-01, QURY-02, QURY-03, QURY-04, QURY-05, QURY-06, QURY-07, QURY-08, QURY-09, QURY-10, RBAC-01, RBAC-02, RBAC-03, RBAC-04, RBAC-05, RBAC-06, RBAC-07, RBAC-08
**Success Criteria** (what must be TRUE):
  1. 쿼리 에디터에서 라인 넘버가 표시되고 GraphQL/DQL 모드를 토글할 수 있으며 템플릿에서 쿼리를 선택하여 실행할 수 있다
  2. 결과가 최대 5개 멀티탭에 표시되고 각 탭에 실행시간 배지가 붙으며 Table/Graph/Treemap/Arc/Scatter/Distribution 6종 뷰로 전환할 수 있다
  3. Role Selector에서 역할을 변경하면 PII 테이블의 마스킹이 실시간으로 전환된다 (super_admin: 전체 보임, auditor: 대부분 Denied)
  4. PII 테이블에서 마스킹된 셀은 배경색(amber/red)과 아이콘으로 구분되고 컬럼 헤더에 PII 등급 배지가 표시된다
  5. FAB Equipment 데모(8행)와 General PII 데모(5행) 두 탭에서 역할별 마스킹 차이를 비교할 수 있다
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
- [ ] 07-02: TBD

## Progress

**Execution Order:**
Phases 3-7 depend on Phase 2 (Layout Shell). Phases 4, 5, 6 have no cross-dependencies and could be parallelized.
Critical path: Phase 1 -> Phase 2 -> Phase 4 (DGraph, highest risk)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Data Layer | 0/4 | Planned | - |
| 2. Layout Shell | 0/2 | Planned | - |
| 3. Ontology Dashboard | 0/? | Not started | - |
| 4. DGraph Monitoring | 0/? | Not started | - |
| 5. GPU Monitoring | 0/3 | Planned | - |
| 6. Ontology Studio & User Management | 0/? | Not started | - |
| 7. Query Console & RBAC | 0/? | Not started | - |
