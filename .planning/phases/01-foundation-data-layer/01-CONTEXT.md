# Phase 1: Foundation & Data Layer - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

D3 차트 개발과 페이지 구축에 필요한 모든 인프라 구축. CSS 토큰 시스템, shadcn/ui 초기화, 다크/라이트 테마, D3 공통 유틸리티, TypeScript 타입 정의, Supabase 스키마/시드 데이터, 클라이언트 하드코딩 데이터, 로딩/빈 상태 UX 기반.

</domain>

<decisions>
## Implementation Decisions

### 디자인 시스템 & 컬러
- exem-ui 글로벌 CSS 변수 기반으로 구축하되, eXemble만의 아이덴티티를 추가
- 블루 계열 액센트 컬러로 exemONE 등 기존 EXEM 제품과 차별화
- EXEM 패밀리 느낌은 유지하면서 eXemble 고유 브랜드 표현
- PRD의 chart series 8색, primitive/semantic 토큰 구조는 유지

### 테마
- 다크 모드를 기본값으로 설정 (defaultTheme="dark")
- 라이트 모드 전환 지원 (토글)
- D3 차트도 테마 전환에 즉시 반응해야 함

### 데이터 충실도
- PRD에 정의된 데이터를 그대로 사용 (이미 충분히 상세함)
- SK실트론 FAB 맥락 (SKS-FAB1-PROD, 장비명, 위치, 온톨로지 타입 등) PRD 그대로 반영
- 페이지 로드 시 약간의 랜덤 변동으로 '살아있는' 데이터 느낌 (실시간 모니터링 시뮬레이션)
- 하드코딩 데이터에 타임스탬프/값에 미세한 jitter 적용하여 생동감

### Claude's Discretion
- Supabase 스키마 세부 구조 (PRD 8테이블 기반, Next.js/Supabase에 맞게 조정)
- 시드 데이터 삽입 전략 (SQL migration vs seed script)
- D3 차트 공통 유틸리티 구체적 API 설계 (cleanupD3Svg, destroyedRef, ResizeObserver)
- 로딩 스켈레톤/빈 상태 디자인
- shadcn/ui + Tailwind CSS 4 호환성 검증 방식

</decisions>

<specifics>
## Specific Ideas

- "EXEM 제품 느낌이지만 eXemble만의 아이덴티티를 가져가고 싶음" — 블루 계열로 차별화
- 차트 데이터에 생동감: 새로고침할 때마다 값이 미세하게 달라지는 느낌 (고정 스크린샷이 아니라 모니터링 툴처럼)
- PRD의 Implementation Guide에 있는 exem-ui 컬러 토큰 시스템을 기반으로 하되 블루 액센트 추가

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-data-layer*
*Context gathered: 2026-02-19*
