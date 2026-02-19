# Phase 6: Ontology Studio & User Management - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

두 페이지: (1) Ontology Studio - 6개 온톨로지 타입의 스키마를 시각적으로 탐색/편집, (2) User Management - 시스템 사용자 역할 관리. 별도 페이지이나 같은 Phase에서 구현.

</domain>

<decisions>
## Implementation Decisions

### Ontology Studio 레이아웃
- 2패널 레이아웃
- 좌측 패널: 타입 리스트 (상단) + 선택된 타입의 상세 패널 (하단: Predicates, Relations, Statistics)
- 우측 패널: D3 온톨로지 그래프 (상단) + 타입 분포 바 차트 (하단)
- 그래프가 넓은 공간을 차지하도록 좌:우 비율 약 35:65

### 온톨로지 그래프 모드
- 3개 모드를 토글로 전환: Force / Radial / Hierarchy (Tree)
- 기본 모드: Force
- Force: 드래그, 줌/팬 지원, 양방향 엣지
- Radial: BFS 기반 링 배치
- Hierarchy: d3.tree() 레이아웃
- 엣지 필터: All (기본) / Outbound / Inbound

### User Management 범위
- 읽기 + 역할 변경 기능 포함
- 유저 테이블: username, email, role 배지 (color-coded), last login
- 역할 배지 호버 시 Tooltip에 PII 접근 권한 요약
- 역할 변경: 드롭다운 셀렉터로 4종 역할(super_admin/service_app/data_analyst/auditor) 변경
- 역할 변경은 클라이언트 상태에서만 반영 (POC이므로 DB 저장 불필요)
- Query Console의 PII 마스킹과 연동 가능하도록 역할 상태 공유

### Claude's Discretion
- 타입 리스트의 선택 UI 스타일 (하이라이트, 아이콘 등)
- 상세 패널의 Predicates/Relations/Statistics 탭 또는 섹션 디자인
- 타입 편집 다이얼로그 구현 방식
- 그래프 노드/엣지 시각화 디테일 (크기, 색상, 라벨)
- 타입 분포 바 차트 Stacked/Grouped 토글 스타일
- 유저 테이블 정렬/필터 기능 범위
- 역할 변경 시 확인 다이얼로그 필요 여부

</decisions>

<deferred>
## Deferred Ideas

없음

</deferred>

---

*Phase: 06-ontology-studio-user-mgmt*
*Context gathered: 2026-02-19*
