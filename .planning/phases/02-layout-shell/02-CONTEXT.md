# Phase 2: Layout Shell - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

비밀번호로 진입하여 6개 페이지를 사이드바로 탐색할 수 있는 완전한 앱 셸. 페이지 콘텐츠(차트, 데이터 등)는 별도 Phase 범위.

</domain>

<decisions>
## Implementation Decisions

### Password Gate
- eXemble 로그인 페이지 레퍼런스 기반: 좌/우 분할 레이아웃 (폼 왼쪽 + 비주얼 오른쪽)
- 오른쪽 비주얼: D3로 온톨로지 그래프 미리보기를 그려서 POC 제품 특성 반영
- POC이므로 비밀번호만 입력 (아이디/SSO 불필요)
- 왼쪽: eXemble 로고 + 비밀번호 입력창 + 로그인 버튼만. 추가 텍스트 없이 미니멀
- 오류 피드백: 입력창 아래 빨간 인라인 텍스트 "비밀번호가 일치하지 않습니다"
- 세션: sessionStorage 기반. 브라우저 닫기 전까지 유지

### Sidebar
- 기본 상태: 확장 (아이콘 + 텍스트 모두 보임)
- 접기 버튼으로 아이콘만 보이게 축소 가능
- 하단: 다크/라이트 테마 토글 + 로그아웃 버튼 배치
- 현재 페이지 표시: 사용자가 디자인 레퍼런스를 추후 제공 예정 (구현 시 기본 하이라이트 적용, 나중에 조정)
- 반응형: 데스크톱 우선. 기본 반응형 기반만 구축 (모바일 본격 대응은 미래 작업)

### Welcome Popup
- 간단 인사 스타일: "환영합니다" + eXemble Ontology Platform / SK Siltron FAB POC Demo + "시작하기" 버튼
- 다시 보지 않기: 세션 기반. 로그아웃하거나 브라우저 창 닫으면 다시 표시

### Command Palette
- Cmd+K (Mac) / Ctrl+K (Windows)로 실행
- 화면 중앙 상단 다이얼로그 팝업 + 배경 디밍
- 텍스트 입력으로 6개 페이지 검색/이동

### Claude's Discretion
- Command Palette 추가 액션 범위 (페이지 탐색 외 테마 전환 등 포함 여부)
- Sidebar 현재 페이지 하이라이트 기본 스타일 (사용자 레퍼런스 도착 전까지)
- Password Gate 오른쪽 D3 온톨로지 그래프의 구체적 시각화 스타일
- Header 영역 구성 (페이지 제목, breadcrumb 등)
- Command Palette 키보드 탐색, 퍼지 검색 등 인터랙션 디테일

</decisions>

<specifics>
## Specific Ideas

- Password Gate는 실제 eXemble 로그인 페이지 (eXemble for expert) 레퍼런스: 다크 배경, 좌/우 분할, 시안/블루 그래디언트 비주얼
- 오른쪽 비주얼을 단순 그래디언트 대신 D3 온톨로지 그래프로 대체하여 제품 정체성 표현
- 반응형은 "데스크톱 기본 + 나중에 모바일 확장 가능한 기반" 수준. 토큰 효율성 고려한 결정

</specifics>

<deferred>
## Deferred Ideas

- Sidebar 현재 페이지 표시 디자인: 사용자가 별도 레퍼런스 보유, 디자인 단계에서 공유 예정
- 모바일/태블릿 본격 반응형: 기반만 깔고 별도 작업으로 진행

</deferred>

---

*Phase: 02-layout-shell*
*Context gathered: 2026-02-19*
