# System Resource Panel 디자인

## 개요

GPU Monitoring 및 Dashboard에서 재사용 가능한 시스템 리소스 패널.
기존 CollapsibleResourcePanel(% 프로그레스바)을 대체하여 180° 반원 게이지 + 서버별 트렌드 Area 차트로 재구성.

## 레이아웃

왼쪽(~25%): 반원 게이지 3개 (CPU, Memory, Disk) 세로 배치
오른쪽(~75%): D3 Stacked Area 차트 3개 (CPU, Memory, Disk) 가로 배치

## 왼쪽 패널 — 180° 반원 게이지

- D3 arc: startAngle=-PI, endAngle=0
- 게이지 안: % 표시 (메인 텍스트)
- 게이지 아래: 실제 수치 (예: 5.8 / 8 Cores, 19.8 / 32 GB, 446 / 800 GB)
- 임계값 색상: <=70% healthy(green), >70% warning(amber), >85% critical(red)
- 80% 이상 glow 효과 (feGaussianBlur, 기존 ResourceGauge 패턴)

## 오른쪽 패널 — D3 Stacked Area 차트

- 3개 차트: CPU, Memory, Disk
- 서버 5개: Server-A ~ Server-E
- Y축: 실제 단위 (CPU: Cores, Memory: GB, Disk: GB)
- X축: 시간 (7분 범위, 1분 간격)
- 서버별 area 영역 (투명도 0.6, chart-1~5 CSS 변수)
- 기존 D3 패턴: theme-aware, ResizeObserver, cleanup

## 데이터

- 새 파일: src/data/system-resource-data.ts
- 서버 5개 정의 (이름, CPU총량, Memory총량, Disk총량)
- getSystemResourceGauges(): 전체 집계 게이지 데이터 (%, 실제값, 총량, 단위)
- getSystemResourceTrends(): 서버별 시계열 데이터

## 컴포넌트

- SystemResourcePanel: 전체 래퍼 (왼쪽 게이지 + 오른쪽 트렌드)
- HalfGauge: 180° 반원 게이지 (D3)
- ResourceTrendChart: 서버별 Stacked Area 차트 (D3)

## 재사용

- GPU Monitoring: 기존 CollapsibleResourcePanel 위치에 교체
- Dashboard: 향후 동일 컴포넌트 배치 가능
