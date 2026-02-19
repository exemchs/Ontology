# Phase 4: DGraph Monitoring - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

12노드 Dgraph 클러스터의 토폴로지, 노드 상태, 쿼리 패턴, 샤드 분포를 인터랙티브하게 탐색. Force simulation이 핵심 기술 위험.

</domain>

<decisions>
## Implementation Decisions

### 클러스터 토폴로지 레이아웃
- 2개 뷰 모드를 토글로 전환: Force / Radial
- 기본 뷰: Force 레이아웃
- Force: 노드 드래그, 줌/팬 인터랙션 지원
- Radial: 중심(Zero) → Alpha → Compute 계층 구조로 방사형 배치

### 노드 상세 패널 (2단계 UX)
- 1단계 (기본): 노드 클릭 시 팝오버 카드로 기본 정보 표시 (이름, 상태, CPU/Memory/Disk, QPS)
- 2단계 (확장): 팝오버 카드 내 특정 아이콘 클릭 시 오른쪽 사이드 패널로 전환하여 상세 정보 표시 (연결 목록, 상세 메트릭, 이벤트 등)
- 사이드 패널은 닫기 버튼으로 복귀

### 파티클 애니메이션
- 기본 ON (데모 시 시각적 임팩트)
- ON/OFF 토글 버튼 제공
- 연결선 위를 이동하는 데이터 흐름 파티클

### Claude's Discretion
- 팝오버 카드 내부 디자인과 배치할 아이콘 종류
- 사이드 패널의 상세 정보 구성 (어떤 메트릭, 어떤 차트)
- 노드 상태 링 색상/펄스 애니메이션 강도
- 파티클 속도, 크기, 색상
- 쿼리 산점도 브러시 선택 UI
- 샤드 바 차트 그룹핑 방식
- Recent Events 목록 스타일

</decisions>

<deferred>
## Deferred Ideas

없음

</deferred>

---

*Phase: 04-dgraph-monitoring*
*Context gathered: 2026-02-19*
