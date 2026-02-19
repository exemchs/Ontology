# Phase 3: Ontology Dashboard - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

랜딩 페이지에서 클러스터 상태, 리소스, 쿼리 트렌드, 온톨로지 관계를 한눈에 파악할 수 있는 대시보드. 7개 컴포넌트(메트릭카드 4, 게이지 3, 듀얼라인, 관계차트, 산점도, 리소스바, 알림).

</domain>

<decisions>
## Implementation Decisions

### 레이아웃 배치
- 2컬럼 그리드 레이아웃
- 상단: 메트릭카드 4종 (1행, full width)
- 2행: 게이지 3종 (1행, full width)
- 3행: 듀얼 라인 차트 (좌) + 온톨로지 관계 차트 (우)
- 4행: 노드 산점도 (좌) + 리소스 바 차트 (우)
- 하단: Recent Alerts 목록 (full width)

### 온톨로지 관계 차트 (3 View Types)
- 3개 뷰 타입을 토글로 전환 가능: Chord Diagram / Force Graph / Sankey Diagram
- 기본 뷰: Force Graph
- Sankey Diagram에는 방향 필터 추가: All (기본) / Inbound / Outbound
- Chord와 Force에는 방향 필터 없음
- 호버 시 관계 하이라이트 (모든 뷰 공통)

### Recent Alerts
- 최근 5건 리스트 표시
- severity 배지 (error/warning/info) + 상대 시간 + 메시지
- 클릭 시 accordion 확장: 노드명, 상세 메시지, resolved 여부 등 상세 정보 표시
- 한 번에 하나만 확장 가능

### Claude's Discretion
- 메트릭카드 내부 디자인 (숫자 크기, 트렌드 아이콘 스타일, 변화율 표시)
- 게이지 270도 아크 내부 디자인 (글로우 효과 강도, 라벨 배치)
- 듀얼 라인 차트 hourly/daily 토글 UI 스타일
- 관계 차트 3개 뷰의 구체적 색상/애니메이션
- 산점도 글로우 효과 강도와 노드 크기
- 리소스 바 차트 Stacked/Grouped 토글 UI 스타일
- Alert accordion 확장 시 보여줄 상세 필드

</decisions>

<deferred>
## Deferred Ideas

없음

</deferred>

---

*Phase: 03-ontology-dashboard*
*Context gathered: 2026-02-19*
