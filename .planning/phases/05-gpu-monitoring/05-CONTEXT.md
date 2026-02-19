# Phase 5: GPU Monitoring - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

4개 A100 GPU의 상태, 성능 트렌드, 활용 패턴을 모니터링하는 UI. 카드, 멀티라인, 히트맵/리즈라인, 비교 바, 이슈/프로세스 테이블.

</domain>

<decisions>
## Implementation Decisions

### GPU 카드 배치
- 1행 4열 (가로 일렬) 배치
- GPU Summary 헤더 위에 총 GPU 수 + 평균 사용률 표시
- 각 카드: GPU 이름, 모델, 상태, 온도, 사용률, 전력

### 히트맵/리즈라인 전환
- 같은 영역에서 토글로 전환 (히트맵 ↔ 리즈라인)
- 히트맵: GPU x Time 매트릭스, sequential color scale, 호버 시 상세 값
- 리즈라인: 4 GPU 밀도 패턴, 수직 오프셋으로 비교

### Health Issues + Processes 배치
- 하단 2컬럼 나란히 배치
- 좌측: Health Issues 목록 (severity 배지 + 메시지)
- 우측: GPU Processes 테이블 (PID, GPU, Memory, Name)

### Claude's Discretion
- GPU 카드 내부 디자인 (미니 게이지, 아이콘, 색상 코딩)
- 성능 트렌드 멀티라인 차트의 탭(Utilization/Temperature/Power/Memory) UI 스타일
- 히트맵 color scale 선택 (sequential warm/cool)
- 리즈라인 오프셋 간격과 그래디언트 스타일
- 비교 바 차트 디자인
- Health Issues 목록 최대 표시 건수
- Processes 테이블 컬럼 구성

</decisions>

<deferred>
## Deferred Ideas

없음

</deferred>

---

*Phase: 05-gpu-monitoring*
*Context gathered: 2026-02-19*
