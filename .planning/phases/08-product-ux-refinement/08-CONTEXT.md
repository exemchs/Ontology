# Phase 8: Product UX Refinement - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning
**Source:** `ontology_solution_spec.md` (기술팀 기획안 기반 전체 재구성)

<domain>
## Phase Boundary

스펙 기반 전체 재구성. 기존 7개 Phase 결과물을 새 스펙에 맞게 재구성하고 누락된 기능을 추가한다. Dashboard를 Dgraph 운영 지표 중심 드래그드롭 그리드로 전환하고, Query Console에 스키마 탐색기/자동완성/챗봇을 추가하며, Ontology Studio에 트리뷰/미니맵/건강점수를 추가하고, User Management를 4탭 체계로 재편한다.

</domain>

<decisions>
## Implementation Decisions

### Dashboard 구조
- Dashboard GPU 탭 제거. 단일 Ontology 대시보드로 유지
- GPU는 대시보드 내 요약 위젯 1개만 (상태 개수: Active/Idle/Error) + GPU Monitoring 링크
- 13개 Dgraph 지표 전부 표시 (NOC 상황판 스타일, 큰 화면 기준)
- 드래그 드롭 그리드: `react-grid-layout` 사용, 4칼럼 기본, 자유 배치 + 크기 조절 가능
- 레이아웃 저장: Supabase 서버 저장 (사용자별 레이아웃 복원)
- 이상 징후: 토스트 알림 + 헤더 바 벨 아이콘에 알림 히스토리 드롭다운

### Dashboard 위젯 체계
- 신호등 위젯: DGraph Target, Alpha Alive → 숫자 + 녹/황/적 아이콘
- 스파크라인 위젯: QPS, TPS → 현재 값 + 최근 1시간 미니 차트
- 임계값 시계열 위젯: Query p95 → 시계열에 경고/위험 수평선
- 메트릭 카드 위젯: Pending Queries, Raft Leader 변경, Errors/sec, Cache Hit Rate
- 추이 차트 위젯: 디스크 사용량 추이, Alpha별 메모리 사용량
- GPU 요약 위젯: GPU 상태 개수 + GPU Monitoring 바로가기
- 일간 요약 위젯: 오늘 vs 어제 비교 (쿼리 수 변화율, 에러 건수)

### GPU Monitoring
- 기존 GPU 카드/트렌드/히트맵 유지 + DCGM 상세 지표 확장
- GPU 파이프라인 퍼널: Total → Allocated → Active → Effective 깔때기 차트
- 프로세스 드릴다운: PID, Command, State, User, Age, Core/Memory Utilization
- GPU 비교 모드: 2~4개 GPU 선택 → 같은 시간축 겹쳐 비교
- 알림 임계값 설정 UI: 지표별 경고/위험 임계값 폼 (UI만 구현, 실제 발송은 mock)
- GPU 클릭 시 우측 슬라이드 패널로 상세 정보

### Graph Cluster (DGraph Monitoring 리네이밍)
- 기존 토폴로지 + 산점도 + 샤드 유지
- 추가: Latency 분포 히스토그램, 시간대별 쿼리 히트맵, 에러 로그 타임라인
- Alpha별 리소스 비교 바 차트

### Ontology Studio
- 기존 3모드 그래프 (Force/Radial/Hierarchy) 유지
- 추가: 좌측 스키마 트리뷰 (타입 > 속성/관계, 우클릭 컨텍스트 메뉴)
- 추가: 그래프 우측 하단 미니맵
- 추가: 스키마 건강 점수 (0~100, 고립 타입/빈 타입 감점)
- 추가: 고립 타입(Orphan), 빈 타입(Empty) 감지 및 표시
- 추가: 관계 밀도, 타입별 데이터 증가 추이, 허브 타입 Top 5
- Records by Type → Treemap 시각화

### Query Console
- Graph (Node-Link) + Table 2개 뷰로 정리. Treemap/Arc/Scatter/Distribution 제거
- 추가: 좌측 스키마 탐색기 트리뷰 (클릭 시 쿼리에 자동 삽입)
- 추가: 쿼리 자동완성 (타입명/속성명 자동 제안)
- 추가: 쿼리 히스토리 (최근 실행 쿼리 목록 + 재실행)
- 추가: 결과 내보내기 (CSV/JSON 다운로드)
- 추가: 결과 탭 배지에 "Nodes: N / Records: N" 표시
- 추가: Graph 뷰 필터링 (특정 타입만 표시/숨김)
- 챗봇: Query Console 내 "자연어 질문" 탭 + 전역 플로팅 팝업 (숨김/표시 토글 가능, POC에서 여차하면 숨김)

### Data Import
- 기존 PG + CSV 폼 유지, UX 플로우 보강 (에러/로딩/성공 상태)

### User Management
- 4개 탭 체계: Namespaces / Users / Access Control / Menu Config
- Users: 사용자 + 관리자 통합 (역할 컬럼으로 구분)
- Access Control: 그룹 + 권한 통합
- Menu Config: 시스템 메뉴 설정

### 네비게이션 구조
```
Overview
  └ Dashboard (단일, 탭 없음)

Monitoring
  ├ GPU Monitoring
  └ Graph Cluster (기존 DGraph Monitoring 리네이밍)

Workspace
  ├ Ontology Studio
  ├ Query Console
  └ Data Import

Admin
  └ User Management (4탭)
```

### 기존 코드 재사용 방침
- D3 차트 유틸리티 (chart-theme, chart-tooltip, chart-utils): 그대로 유지
- MetricCard 패턴: 유지하되 내부 확장 (신호등, 스파크라인)
- 대시보드 페이지: 완전 재구성 (드래그드롭 그리드 + 새 위젯 체계)
- 기존 대시보드 특화 차트: 해당 상세 페이지로 이동 또는 위젯화
- GPU Monitoring: 기존 유지 + 확장
- Graph Cluster: 기존 유지 + 확장
- Ontology Studio: 기존 유지 + 확장
- Query Console: Graph+Table로 간소화, 나머지 뷰 제거, 새 기능 추가
- shadcn/ui 컴포넌트, 테마 시스템, Supabase 인프라: 그대로 유지

### Claude's Discretion
- 드래그드롭 그리드의 위젯 기본 크기/위치 배치
- 스파크라인 차트 세부 디자인 (라인 두께, 영역 채움 등)
- GPU 퍼널 차트 구현 방식 (D3 vs CSS)
- 스키마 건강 점수 산정 공식 세부 가중치
- 쿼리 자동완성 구현 깊이 (CodeMirror extension vs 커스텀)
- 챗봇 플로팅 팝업 위치/크기/애니메이션
- 에러 로그 타임라인 세부 인터랙션

</decisions>

<specifics>
## Specific Ideas

- "큰 화면에 띄워두고 볼 수 있는 상황판 느낌" — NOC 스타일 대시보드
- 대시보드 레이아웃은 사용자가 드래그 드롭으로 자유롭게 재배치할 수 있어야 함
- 레이아웃 저장은 서버(Supabase)에 — 로그인하면 어디서든 복원
- 챗봇은 Query Console 탭 + 플로팅 팝업 양쪽에 존재, 숨길 수 있는 기능 필수 (POC 데모 시 품질 문제 시 숨김 처리)
- 알림 히스토리는 헤더 바 벨 아이콘 드롭다운으로 접근
- GPU Dashboard 탭은 별도 필요 없음 — GPU Monitoring 페이지가 있으므로 대시보드에 요약 위젯만
- User Management "관리자 관리"는 별도 탭 불필요 — 사용자 테이블의 역할 컬럼으로 충분
- "그룹 관리"와 "권한 관리"는 통합 — 따로 있으면 개념 혼란
- 기존 Query Console 6종 뷰 중 Treemap/Arc/Scatter/Distribution 에러 많아 제거 결정

</specifics>

<deferred>
## Deferred Ideas

- Effective GPU 집계 로직 (높은 난이도, 중기 도입)
- GPU 인사이트: Pod/Job별 GPU 할당량 분석
- 클러스터 모니터링: Node/Pod/Deployment 상태 현황
- Dgraph API 실제 연동 (현재 mock 데이터)
- 알림 실제 발송 (이메일/Slack 연동)
- 대시보드 레이아웃 프리셋/템플릿 공유 기능

</deferred>

---

*Phase: 08-product-ux-refinement*
*Context gathered: 2026-02-20*
