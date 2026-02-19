# Phase 7: Query Console & RBAC - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

킬러 데모 피처. GraphQL/DQL 쿼리 실행 + 6종 시각화 결과 + 역할별 PII 마스킹 실시간 시연. CodeMirror 에디터, 멀티탭 결과, PII 데모 2종.

</domain>

<decisions>
## Implementation Decisions

### 쿼리 에디터
- CodeMirror 6 사용 (경량 에디터 라이브러리)
- 문법 하이라이팅, 라인 넘버 내장
- GraphQL / DQL 모드 토글 (상단에 모드 선택 UI)
- 다크/라이트 테마 연동
- 템플릿 셀렉터: 드롭다운으로 4개 쿼리 템플릿 선택 시 에디터에 자동 삽입

### 결과 뷰 6종 전환
- 아이콘 탭바로 전환 (결과 영역 상단에 6개 아이콘 탭)
- 뷰 종류: Table / Graph / Treemap / Arc Diagram / Scatter / Distribution
- 기본 뷰: Table
- 멀티탭: 최대 5개 결과 탭 (각 탭에 실행시간 배지)

### PII 데모 화면
- FAB Equipment | General PII 탭 전환
- Role Selector: 탭 위에 공통 배치 (드롭다운, 4종 역할)
- Info Banner: 선택된 역할의 권한 요약 메시지
- 역할 변경 시 마스킹이 실시간 전환
- 마스킹된 셀: amber(masked)/red(anonymized/denied) 배경색 + 아이콘
- 컬럼 헤더: PII 등급 배지 (highest/high/medium/low/none)
- FAB Equipment: 8행 데이터
- General PII: 5행 데이터

### Claude's Discretion
- CodeMirror 6 구체적 extension 선택 (basicSetup, 언어별 모드 등)
- 에디터 높이와 리사이즈 가능 여부
- 아이콘 탭바의 아이콘 선택과 스타일
- 멀티탭 UI 디자인 (탭 닫기 버튼, 최대 초과 시 동작)
- PII 테이블의 컬럼 너비와 셀 스타일링 디테일
- 쿼리 히스토리 UI (Supabase API 기반)
- 각 D3 시각화(Graph/Treemap/Arc/Scatter/Distribution)의 구체적 인터랙션

</decisions>

<deferred>
## Deferred Ideas

없음

</deferred>

---

*Phase: 07-query-console-rbac*
*Context gathered: 2026-02-19*
