# S-PRIME ERP 시스템 — 개발자 인수인계 문서

> **최종 갱신**: 2026-03-14  
> **대상 독자**: React 경험이 없는 프론트엔드/풀스택 개발자  
> **목적**: 이 문서 하나로 프로젝트 구조와 동작 원리를 파악하고 즉시 작업에 착수할 수 있도록 함

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택 한눈에 보기](#2-기술-스택-한눈에-보기)
3. [React 핵심 개념 (5분 속성)](#3-react-핵심-개념-5분-속성)
4. [프로젝트 설치 및 실행](#4-프로젝트-설치-및-실행)
5. [폴더 구조](#5-폴더-구조)
6. [앱 부팅 흐름 (시작점 → 화면 렌더링)](#6-앱-부팅-흐름)
7. [인증(로그인) 시스템](#7-인증로그인-시스템)
8. [라우팅 — URL과 페이지 매핑](#8-라우팅--url과-페이지-매핑)
9. [레이아웃 구조 (사이드바 + 헤더 + 본문)](#9-레이아웃-구조)
10. [페이지별 기능 설명](#10-페이지별-기능-설명)
11. [디자인 시스템 (색상·테마·스타일)](#11-디자인-시스템)
12. [공통 컴포넌트 사용법](#12-공통-컴포넌트-사용법)
13. [데이터 흐름 — Mock 데이터 구조](#13-데이터-흐름--mock-데이터-구조)
14. [자주 하는 작업 가이드](#14-자주-하는-작업-가이드)
15. [알아두면 좋은 것들](#15-알아두면-좋은-것들)
16. [폼 검증 시스템 (Zod + react-hook-form)](#16-폼-검증-시스템)
17. [반응형 모바일 대응](#17-반응형-모바일-대응)
18. [서비스 레이어 — C# 백엔드 연동 구조](#18-서비스-레이어--c-백엔드-연동-구조)
19. [포맷 유틸리티](#19-포맷-유틸리티)
20. [배포 (Deployment)](#20-배포-deployment)

---

## 1. 프로젝트 개요

**S-PRIME ERP**는 반도체 정밀기기 제조업체를 위한 **통합 생산·재고·물류 관리 시스템**의 프론트엔드 프로토타입입니다.

- **언어**: 일본어 (UI 텍스트 전체가 일본어)
- **현재 상태**: 프론트엔드 전용 (백엔드/DB 연동 없음, 모든 데이터는 Mock). 단, C# .NET Core 백엔드 연동을 위한 **서비스 레이어, 타입 정의, React Query 훅이 이미 구축됨**.
- **주요 기능**:
  - 대시보드 (KPI, 차트, 재고현황)
  - 생산 전표 생성 및 실행 관리
  - 출고 전표 생성 및 배송 관리
  - BOM(자재명세서) 기반 생산 전표
  - 재무제표(B/S, P/L) 조회
  - 청구서/발주서 관리
  - 마스터 데이터 관리 (사원, 품목, 창고)

---

## 2. 기술 스택 한눈에 보기

| 기술 | 역할 | 설명 |
|------|------|------|
| **React 18** | UI 라이브러리 | 화면을 컴포넌트 단위로 쪼개서 조립하는 라이브러리 |
| **TypeScript** | 타입 안전 | JavaScript에 타입을 추가한 언어. `.tsx` 파일 = TypeScript + React |
| **Vite** | 빌드 도구 | 개발 서버 실행, 빌드 담당. `vite.config.ts`에서 설정 |
| **Tailwind CSS** | 스타일링 | HTML 클래스 이름으로 CSS를 작성 (예: `bg-primary text-xs p-4`) |
| **shadcn/ui** | UI 컴포넌트 | Button, Table, Select 등 미리 만들어진 UI 부품 모음 |
| **React Router** | 페이지 전환 | URL별로 다른 컴포넌트를 보여주는 라이브러리 |
| **Recharts** | 차트 | 대시보드에 쓰이는 그래프 라이브러리 |
| **date-fns** | 날짜 처리 | 날짜 포맷팅, 파싱 유틸리티 |
| **Lucide React** | 아이콘 | 아이콘 라이브러리 (예: `<Factory />`, `<Search />`) |
| **@react-pdf/renderer** | PDF 생성 | 브라우저에서 직접 PDF를 생성하고 다운로드 (NotoSansJP 폰트 사용) |
| **@tanstack/react-query** | 비동기 상태 | API 연동 시 데이터 fetching, 캐싱, 뮤테이션 관리 |
| **Zod** | 스키마 검증 | 폼 데이터의 유효성 검증, TypeScript 타입 자동 생성 |
| **react-hook-form** | 폼 관리 | 고성능 폼 상태 관리 + Zod 연동 (zodResolver) |

---

## 3. React 핵심 개념 (5분 속성)

React를 전혀 모른다면, 아래 개념만 알면 이 코드를 이해할 수 있습니다.

### 3.1 컴포넌트 = 함수

```tsx
// 이것이 "컴포넌트"입니다. 그냥 HTML을 리턴하는 함수예요.
const MyButton = () => {
  return <button className="bg-primary text-white">클릭</button>;
};

// 다른 곳에서 이렇게 쓸 수 있어요:
<MyButton />
```

### 3.2 useState = 변수 (값이 바뀌면 화면이 자동 갱신)

```tsx
const [count, setCount] = useState(0);
// count: 현재 값 (읽기 전용)
// setCount: 값을 바꾸는 함수 (이걸 호출하면 화면이 다시 그려짐)

// 사용 예:
<button onClick={() => setCount(count + 1)}>
  {count}번 클릭됨
</button>
```

**이 프로젝트에서의 실제 예시**:
```tsx
const [currentPage, setCurrentPage] = useState(1);        // 현재 페이지 번호
const [searchText, setSearchText] = useState("");           // 검색어
const [itemsPerPage, setItemsPerPage] = useState(10);      // 페이지당 표시 건수
```

### 3.3 useEffect = 부수 효과 (화면이 그려진 후 실행되는 코드)

```tsx
useEffect(() => {
  console.log("테마가 바뀌었다!", theme);
  document.documentElement.classList.add("dark");
}, [theme]);
// [theme] ← theme 값이 바뀔 때만 실행됨
// [] ← 빈 배열이면 처음 한 번만 실행
```

### 3.4 Context = 전역 상태 (여러 컴포넌트가 공유하는 데이터)

이 프로젝트에는 2개의 Context가 있습니다:
- **AuthContext** (`use-auth.tsx`): 로그인 상태, 유저 정보
- **ThemeContext** (`use-theme.tsx`): 다크/라이트 테마

사용 방법:
```tsx
const { isLoggedIn, user, login, logout } = useAuth();  // 어디서든 호출 가능
const { theme, toggleTheme } = useTheme();                // 어디서든 호출 가능
```

### 3.5 Props = 컴포넌트에 전달하는 인자

```tsx
// 정의
const KPICard = ({ title, value }: { title: string; value: string }) => {
  return <div>{title}: {value}</div>;
};

// 사용
<KPICard title="월간생산량" value="12,345" />
```

### 3.6 JSX 문법 핵심

```tsx
// if문 대신 삼항연산자:
{isLoggedIn ? <Dashboard /> : <Login />}

// if문 대신 && 연산자:
{error && <p className="text-red-500">{error}</p>}

// 배열을 목록으로:
{items.map((item) => (
  <TableRow key={item.id}>
    <TableCell>{item.name}</TableCell>
  </TableRow>
))}
```

---

## 4. 프로젝트 설치 및 실행

```bash
# 1. 의존성 설치 (최초 1회)
npm install

# 2. 개발 서버 실행
npm run dev
# → http://localhost:8080 으로 접속

# 3. 프로덕션 빌드
npm run build

# 4. 테스트 실행
npm test
```

**경로 별칭**: `@/` = `src/` 폴더를 의미합니다.
```tsx
import { Button } from "@/components/ui/button";
// 실제 경로: src/components/ui/button.tsx
```

---

## 5. 폴더 구조

```
src/
├── main.tsx                    ← ★ 앱 최초 진입점
├── App.tsx                     ← ★ 라우팅(URL→페이지 매핑) 정의
├── index.css                   ← ★ 전체 색상/테마 변수 정의
│
├── pages/                      ← ★ 각 화면(페이지) 컴포넌트
│   ├── Login.tsx               ← 로그인 화면
│   ├── Index.tsx               ← 대시보드 (메인 화면)
│   ├── ProductionExecution.tsx ← 제품생산 및 실행 (전표 상세)
│   ├── ProductionSlipCreate.tsx← 생산 전표 신규 작성
│   ├── ShipmentManagement.tsx  ← 출고 및 재고조정 (전표 상세)
│   ├── ShipmentSlipCreate.tsx  ← 출고 전표 신규 작성
│   ├── SlipListPage.tsx        ← 생산출고 의뢰 일람 (횡단 검색)
│   ├── BomProductionSlip.tsx   ← BOM 생산 전표 일람
│   ├── BomSlipCreate.tsx       ← BOM 생산 전표 신규 작성
│   ├── FinancialStatements.tsx ← 재무제표 조회 (B/S, P/L)
│   ├── InvoiceManagement.tsx   ← 청구서/발주서 관리
│   ├── EmployeeMaster.tsx      ← 사원 마스터
│   ├── ItemMaster.tsx          ← 품목 마스터
│   ├── WarehouseMaster.tsx     ← 창고 거점 마스터
│   ├── CompanyIntro.tsx        ← 회사 소개
│   ├── PlaceholderPage.tsx     ← 빈 페이지 (미구현 메뉴용)
│   └── NotFound.tsx            ← 404 페이지
│
├── components/
│   ├── erp/                    ← ★ ERP 전용 커스텀 컴포넌트
│   │   ├── ERPLayout.tsx       ← 전체 레이아웃 (사이드바 + sticky 고정 헤더 + 본문)
│   │   ├── ERPSidebar.tsx      ← 좌측 사이드바 네비게이션
│   │   ├── KPICard.tsx         ← 대시보드 KPI 카드
│   │   ├── DashboardChart.tsx  ← 대시보드 차트
│   │   ├── CompanyNews.tsx     ← 회사 뉴스 위젯
│   │   ├── InventoryStatus.tsx ← 재고 현황 위젯
│   │   ├── ProductionLine.tsx  ← 생산 라인 현황
│   │   ├── RecentOrders.tsx    ← 최근 주문
│   │   ├── SafetyStockAlert.tsx← 안전재고 알림
│   │   ├── SlipStatusChart.tsx ← 전표 상태 차트
│   │   ├── StatusFlowStepper.tsx ← 전표 상태 흐름 스텝퍼
│   │   ├── ItemSelectModal.tsx ← 품목 선택 모달
│   │   └── PaginationControls.tsx ← 재사용 가능한 페이지네이션 UI 컴포넌트
│   │
│   ├── pdf/                    ← ★ PDF 생성 전용 컴포넌트 (@react-pdf/renderer)
│   │   ├── SlipPdfDocument.tsx ← 전표 PDF 레이아웃 (발주서/청구서/생산/출고/BOM)
│   │   ├── pdf-styles.ts       ← PDF용 StyleSheet 정의 (NotoSansJP 폰트 포함)
│   │   ├── pdf-types.ts        ← PdfDocumentData, PdfLineItem 타입 정의
│   │   └── index.ts            ← 통합 export
│   │
│   └── ui/                     ← shadcn/ui 공통 UI 컴포넌트 (수정 거의 안 함)
│       ├── button.tsx
│       ├── table.tsx
│       ├── select.tsx
│       ├── date-picker.tsx     ← 커스텀 날짜 선택기 (입력+캘린더)
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       └── ... (약 40개)
│
├── hooks/                      ← 커스텀 훅 (전역 상태 관리)
│   ├── use-auth.tsx            ← 로그인/로그아웃 상태
│   ├── use-theme.tsx           ← 다크/라이트 테마
│   ├── use-mobile.tsx          ← 모바일 여부 감지 (useIsMobile)
│   ├── use-pagination.tsx      ← usePagination() 페이지네이션 공통 훅
│   ├── use-pdf-download.tsx    ← PDF 생성 및 다운로드 훅
│   └── api/                    ← React Query 데이터 fetching 훅
│       ├── index.ts
│       ├── use-slips.tsx
│       ├── use-employees.tsx
│       ├── use-items.tsx
│       ├── use-warehouses.tsx
│       └── use-partners.tsx
│
├── services/                    ← ★ API 통신 서비스 레이어 (C# 백엔드 연동용)
│   ├── api-client.ts           ← HTTP 클라이언트 (fetch 래퍼, 인증, 타임아웃)
│   ├── auth.service.ts         ← 인증 API (로그인, 로그아웃, 토큰 갱신)
│   ├── slip.service.ts         ← 전표 API (CRUD + 상태 변경)
│   ├── master.service.ts       ← 마스터 API (사원/품목/창고/거래처)
│   └── index.ts                ← 통합 export
│
├── types/                       ← ★ TypeScript 타입 정의 (C# 모델과 1:1 매핑)
│   ├── api.types.ts            ← ApiResponse<T>, PaginatedResponse<T>, LoginRequest 등
│   ├── slip.types.ts           ← 전표 관련 타입
│   ├── master.types.ts         ← 마스터 관련 타입
│   └── index.ts                ← 통합 export
│
└── lib/
    ├── utils.ts                ← cn() 유틸리티 (Tailwind 클래스 병합)
    ├── constants.ts            ← BRAND_HUE 등 전역 상수
    ├── slip-utils.ts           ← 전표 상태 관리, 전표 번호 생성 유틸
    ├── format-utils.ts         ← 금액(¥), 날짜, 숫자 포맷팅 유틸
    └── schemas/                ← ★ Zod 검증 스키마
        ├── slip.schema.ts      ← 전표 생성/수정 검증
        ├── employee.schema.ts  ← 사원 등록/수정 검증
        ├── item.schema.ts      ← 품목 등록/수정 검증
        └── index.ts            ← 통합 export
```

---

## 6. 앱 부팅 흐름

앱이 시작되는 순서를 따라가면 전체 구조가 보입니다:

```
index.html
  └→ src/main.tsx              (1) React 앱 시작점
       └→ ThemeProvider         (2) 다크/라이트 테마 제공
            └→ AuthProvider     (3) 로그인 상태 제공
                 └→ App.tsx     (4) URL에 따라 어떤 페이지를 보여줄지 결정
                      └→ 각 페이지 컴포넌트 렌더링
```

**상세 설명**:

1. **`main.tsx`** — React를 DOM에 마운트합니다. `<ThemeProvider>`와 `<AuthProvider>`로 전역 상태를 감쌉니다.

2. **`ThemeProvider`** (`use-theme.tsx`) — `localStorage`에서 테마(dark/light) 저장·복원. `<html>` 태그에 `dark` 클래스를 추가/제거.

3. **`AuthProvider`** (`use-auth.tsx`) — `sessionStorage`에서 로그인 상태 저장·복원. `login()`, `logout()` 함수 제공.

4. **`App.tsx`** — 모든 URL 경로를 정의. 로그인 안 된 상태면 `/login`으로 강제 이동 (`ProtectedRoute`).

---

## 7. 인증(로그인) 시스템

### 현재 구현 상태: **데모용 (아무 ID/PW로 로그인 가능)**

```
src/hooks/use-auth.tsx
```

- **로그인**: `login(username, password)` — username과 password가 비어있지 않으면 무조건 성공
- **세션 유지**: `sessionStorage`에 저장 (브라우저 탭 닫으면 로그아웃)
- **로그아웃**: `logout()` — sessionStorage 삭제 후 로그인 화면으로 이동

### 로그인 보호 (ProtectedRoute)

`App.tsx`에서 `/login`을 제외한 모든 경로를 `<ProtectedRoute>`로 감쌉니다:

```tsx
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
```

→ 로그인 안 된 상태로 어떤 URL에 접근해도 자동으로 `/login`으로 리다이렉트됩니다.

---

## 8. 라우팅 — URL과 페이지 매핑

`App.tsx`에 정의된 전체 경로 목록입니다:

| URL 경로 | 페이지 컴포넌트 | 설명 |
|----------|----------------|------|
| `/login` | `Login` | 로그인 화면 |
| `/` | `Index` | 전체 대시보드 |
| `/company` | `CompanyIntro` | 회사 소개 |
| `/production/slips` | `SlipListPage` | 생산출고 의뢰 일람 |
| `/production/execution` | `ProductionExecution` | 생산 전표 상세/실행 |
| `/production/execution/new` | `ProductionSlipCreate` | 생산 전표 신규 작성 |
| `/production/shipping` | `ShipmentManagement` | 출고 전표 상세/관리 |
| `/production/shipping/new` | `ShipmentSlipCreate` | 출고 전표 신규 작성 |
| `/documents/finance` | `FinancialStatements` | 재무제표 조회 |
| `/documents/bom` | `BomProductionSlip` | BOM 생산 전표 일람 |
| `/documents/bom/new` | `BomSlipCreate` | BOM 전표 신규 작성 |
| `/documents/invoice` | `InvoiceManagement` | 청구서/발주서 |
| `/master/employee` | `EmployeeMaster` | 사원 마스터 |
| `/master/item` | `ItemMaster` | 품목 마스터 |
| `/master/warehouse` | `WarehouseMaster` | 창고 거점 마스터 |
| `*` | `NotFound` | 404 페이지 |

### 새 페이지 추가 방법

1. `src/pages/NewPage.tsx` 파일 생성
2. `App.tsx`에 import 추가 및 `<Route>` 추가
3. `ERPSidebar.tsx`에 메뉴 항목 추가

---

## 9. 레이아웃 구조

로그인 후 보이는 모든 화면은 `ERPLayout`으로 감싸져 있습니다.

```
┌─────────────────────────────────────────────────┐
│ [사이드바]  │  [헤더 바]                          │
│             │  ┌─────────────────────────────┐   │
│  회사소개    │  │ 검색 | 테마 | 알림 | 유저    │   │
│  ─────────  │  └─────────────────────────────┘   │
│  대시보드    │                                    │
│  생산·제조 ▼│  ┌─────────────────────────────┐   │
│   의뢰일람   │  │                             │   │
│   생산실행   │  │    본문 콘텐츠 (children)     │   │
│   출고관리   │  │    = 각 페이지의 내용         │   │
│  전표·서류 ▼│  │                             │   │
│   재무제표   │  │                             │   │
│   BOM전표    │  └─────────────────────────────┘   │
│   청구서     │                                    │
│  마스터 ▼   │                                    │
│   사원       │                                    │
│   품목       │                                    │
│   창고       │                                    │
└─────────────────────────────────────────────────┘
```

### ERPLayout (`src/components/erp/ERPLayout.tsx`)

- **사이드바**: `ERPSidebar` 컴포넌트. 마우스 호버 시 자동 확장/축소.
- **상단 헤더**: `sticky top-0 z-40` 으로 스크롤 시에도 상단 고정. 검색, 테마 토글, 알림 패널, 유저 메뉴(설정/로그아웃) 포함.
- **본문**: `{children}` = 각 페이지의 내용이 여기에 들어감

### ERPSidebar (`src/components/erp/ERPSidebar.tsx`)

메뉴 구조는 `menuItems` 배열로 관리됩니다:

```tsx
const menuItems = [
  { id: "dashboard", label: "全体ダッシュボード", path: "/" },
  { id: "production", label: "生産・製造", path: "/production",
    children: [
      { id: "prod-list", label: "生産出庫依頼一覧", path: "/production/slips" },
      { id: "prod-exec", label: "製品生産および実行", path: "/production/execution" },
      // ...
    ]
  },
  // ...
];
```

**메뉴 추가/수정**: 이 배열만 수정하면 됩니다.

---

## 10. 페이지별 기능 설명

### 10.1 대시보드 (`Index.tsx`)

- KPI 카드 4개 (생산량, 재고회전율, 매출, 불량률)
- 매출/생산 차트 (Recharts)
- 재고현황, 생산라인 현황, 최근주문, 안전재고 알림 위젯

### 10.2 생산출고 의뢰 일람 (`SlipListPage.tsx`)

- **기능**: 생산(製造購買)과 출고(出庫) 전표를 횡단 검색
- **검색 조건**: 전표구분, 상태, 날짜(FROM/TO), 의뢰자, 승인자, 담당자, 키워드
- **테이블**: 검색 결과 표시, 페이지네이션(5/10/15/20건)
- **상세 버튼**: 클릭 시 해당 전표 상세 페이지로 이동

### 10.3 생산 전표 (`ProductionExecution.tsx` + `ProductionSlipCreate.tsx`)

- **일람/상세 보기**: 기존 전표를 선택하여 상세 정보 확인
- **상태 플로우**: S00(작성중) → S01(신청중) → A01(승인) → P01(견적) → P02(발주) → P03(분납) → P04(입고) → I00(검수)
- **신규 작성**: 품목 추가(모달), 수량·희망납기 입력, 저장

### 10.4 출고 전표 (`ShipmentManagement.tsx` + `ShipmentSlipCreate.tsx`)

- **상태 플로우**: S00 → S01 → A01 → T01(적송중) → T02(출고완료) → T03(매출확정)
- **신규 작성**: 고객 선택, 출고 창고, 배송지, 품목 추가

### 10.5 BOM 생산 전표 (`BomProductionSlip.tsx` + `BomSlipCreate.tsx`)

- 완제품 선택 시 BOM(자재명세서) 자동 전개
- 레벨별 소요 자재, 소요량, 재고량 표시

### 10.6 재무제표 (`FinancialStatements.tsx`)

- B/S(대차대조표), P/L(손익계산서) 조회
- 기간 선택, PDF 출력 버튼 (UI만 구현)

### 10.7 청구서/발주서 (`InvoiceManagement.tsx`)

- 전표 목록 + PDF 미리보기 형태
- 체크박스 일괄 선택, 인쇄 상태 관리

### 10.8 마스터 관리 (`EmployeeMaster.tsx`, `ItemMaster.tsx`, `WarehouseMaster.tsx`)

- 목록 표시 + 검색 + 페이지네이션 (5/10/15건 선택 가능)
- 신규 추가/편집/삭제 (클라이언트 상태로만 동작)

---

## 11. 디자인 시스템

### 11.1 테마 (색상 변수)

모든 색상은 `src/index.css`에서 CSS 변수로 정의됩니다:

```css
:root {            /* 라이트 모드 */
  --primary: 185 72% 38%;      /* 주요 색상 (청록색) */
  --background: 210 20% 96%;   /* 배경 */
  --foreground: 220 20% 14%;   /* 글자 */
  --success: 152 60% 38%;      /* 성공 (녹색) */
  --warning: 38 92% 50%;       /* 경고 (노란색) */
  --destructive: 0 72% 51%;    /* 오류/삭제 (빨간색) */
  /* ... */
}
.dark {            /* 다크 모드 */
  --primary: 185 72% 48%;
  --background: 220 20% 7%;
  /* ... */
}
```

**핵심 원칙**: 컴포넌트에서 `bg-red-500` 같은 직접 색상을 쓰지 않고, 반드시 `bg-primary`, `text-destructive` 같은 시맨틱 토큰을 사용합니다.

### 11.2 Tailwind 클래스 설명

자주 쓰이는 패턴:

| 클래스 | 의미 |
|--------|------|
| `bg-background` | 페이지 배경색 |
| `bg-card` | 카드 배경색 |
| `text-foreground` | 기본 글자색 |
| `text-muted-foreground` | 보조 글자색 (회색) |
| `text-primary` | 주요 강조색 |
| `border-border` | 기본 테두리색 |
| `text-xs` | 14px (이 프로젝트에서 기본 크기로 오버라이드됨) |
| `text-sm` | 16px |
| `h-8` | 높이 32px (입력 필드, 버튼 등) |
| `px-4 py-2` | 좌우 패딩 16px, 상하 패딩 8px |
| `gap-3` | 요소 간 간격 12px |
| `grid grid-cols-4` | 4열 그리드 |

### 11.3 글꼴

- **본문**: `BIZ UDGothic` (일본어 고딕체)
- **코드/숫자**: `JetBrains Mono` (고정폭 폰트, `font-mono` 클래스)
- **최소 글자 크기**: `index.css`에서 8~13px 텍스트를 14px로 강제 오버라이드 (일본어 가독성)

---

## 12. 공통 컴포넌트 사용법

### 12.1 DatePicker (날짜 선택기)

`src/components/ui/date-picker.tsx` — **직접 입력 + 캘린더 선택** 모두 가능

```tsx
import { DatePicker } from "@/components/ui/date-picker";

// 기본 사용 (문자열 값)
<DatePicker value="2024-03-07" onChange={(date) => console.log(date)} />

// 상태와 연결
const [date, setDate] = useState("2024-03-01");
<DatePicker value={date} onChange={(d) => setDate(d ? format(d, "yyyy-MM-dd") : "")} />

// 비활성화
<DatePicker value="2024-03-07" disabled />
```

### 12.2 Table (테이블)

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>이름</TableHead>
      <TableHead>부서</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.dept}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 12.3 Select (셀렉트박스)

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger className="h-8 text-xs">
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">옵션 1</SelectItem>
    <SelectItem value="opt2">옵션 2</SelectItem>
  </SelectContent>
</Select>
```

### 12.4 Badge (상태 뱃지)

```tsx
import { Badge } from "@/components/ui/badge";

<Badge className="bg-success/20 text-success">승인완료</Badge>
<Badge className="bg-warning/20 text-warning">대기중</Badge>
<Badge className="bg-destructive/20 text-destructive">거부</Badge>
```

### 12.5 Card (카드)

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card className="border-border bg-card">
  <CardHeader className="py-3 px-4">
    <CardTitle className="text-sm font-semibold">제목</CardTitle>
  </CardHeader>
  <CardContent className="px-4 pb-4">
    내용
  </CardContent>
</Card>
```

### 12.6 StatusFlowStepper (전표 상태 흐름)

```tsx
import StatusFlowStepper from "@/components/erp/StatusFlowStepper";

const steps = [
  { code: "S00", label: "作成中" },
  { code: "S01", label: "申請中" },
  { code: "A01", label: "承認済" },
  // ...
];

<StatusFlowStepper steps={steps} currentStatus="A01" />
```

### 12.8 usePdfDownload (PDF 생성·다운로드)

`src/hooks/use-pdf-download.tsx` — 브라우저에서 직접 PDF를 생성하고 저장합니다.

```tsx
import { usePdfDownload } from "@/hooks/use-pdf-download";
import type { PdfDocumentData } from "@/components/pdf";

const { downloadPdf, downloadMultiplePdfs, isGenerating } = usePdfDownload();

// 단건 다운로드
await downloadPdf(pdfData, "발주서_001.pdf");

// 일괄 다운로드 (여러 전표 한 번에)
await downloadMultiplePdfs([pdfData1, pdfData2]);
```

**`PdfDocumentData` 주요 필드:**

| 필드 | 타입 | 설명 |
|------|------|------|
| `docType` | `"po" \| "invoice" \| "production" \| "shipment" \| "bom"` | 전표 유형 |
| `docNo` | `string` | 전표 번호 (파일명 기본값으로 사용) |
| `issueDate` | `string` | 발행 일자 |
| `partner` | `string` | 거래처 이름 |
| `items` | `PdfLineItem[]` | 품목 행 배열 |
| `subtotal` | `number` | 소계 |
| `taxAmount` | `number` | 소비세 |
| `totalAmount` | `number` | 합계 금액 |

> **폰트**: PDF 내 일본어는 Google Fonts CDN의 `NotoSansJP`를 사용합니다. 네트워크 없이 생성 시 폰트 로딩이 실패할 수 있습니다.

### 12.9 PaginationControls (페이지네이션 UI)

`src/components/erp/PaginationControls.tsx` — `usePagination` 훅과 쌍으로 사용되는 페이지네이션 UI입니다.

```tsx
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/erp/PaginationControls";

const pagination = usePagination(filteredData, 10);

return (
  <>
    <Table>
      {pagination.paged.map(item => <TableRow key={item.id}>...</TableRow>)}
    </Table>
    <PaginationControls pagination={pagination} />
  </>
);
```

---

## 13. 데이터 흐름 — Mock 데이터 구조


### ⚠️ 중요: 현재 모든 데이터는 하드코딩(Mock)입니다

각 페이지 파일 상단에 Mock 데이터 배열이 정의되어 있습니다:

```tsx
// ProductionExecution.tsx 예시
const mockSlips = [
  { slipNo: "SLP20240307-001", date: "2024-03-07", requester: "田中 太郎", ... },
  { slipNo: "SLP20240305-003", date: "2024-03-05", ... },
];
```

### 데이터가 저장되지 않는 이유

- `useState`로 관리되는 데이터는 **페이지를 새로고침하면 초기화**됩니다
- 마스터 관리에서 추가/편집/삭제한 내용도 새로고침 시 원래 Mock 데이터로 되돌아감
- 실제 운영을 위해서는 백엔드(DB) 연동이 필수

### 백엔드 연동 시 변경 포인트

각 페이지에서 Mock 데이터 배열을 API 호출로 교체하면 됩니다:

```tsx
// Before (현재):
const [employees, setEmployees] = useState(mockEmployees);

// After (API 연동):
const { data: employees } = useQuery({
  queryKey: ['employees'],
  queryFn: () => fetch('/api/employees').then(r => r.json()),
});
```

> `@tanstack/react-query`가 이미 설치되어 있으므로 API 호출 시 `useQuery`를 사용하면 됩니다.

---

## 14. 자주 하는 작업 가이드

### 14.1 새 페이지 추가

```bash
# 1. 페이지 파일 생성
# src/pages/NewFeature.tsx
```

```tsx
import ERPLayout from "@/components/erp/ERPLayout";

const NewFeature = () => {
  return (
    <ERPLayout>
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-foreground">新機能</h1>
        {/* 내용 */}
      </div>
    </ERPLayout>
  );
};

export default NewFeature;
```

```tsx
// 2. App.tsx에 라우트 추가
import NewFeature from "./pages/NewFeature";

<Route path="/new-feature" element={<ProtectedRoute><NewFeature /></ProtectedRoute>} />
```

```tsx
// 3. ERPSidebar.tsx의 menuItems에 메뉴 추가
{ id: "new-feature", label: "新機能", icon: SomeIcon, path: "/new-feature" },
```

### 14.2 테이블에 페이지네이션 추가 (패턴 복사)

```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

const totalPages = Math.ceil(filteredData.length / itemsPerPage);
const pagedData = filteredData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

// 페이지네이션 UI는 EmployeeMaster.tsx를 참고하세요
```

### 14.3 검색 필터 추가

```tsx
const [searchText, setSearchText] = useState("");

const filtered = allData.filter((item) => {
  if (searchText) {
    const q = searchText.toLowerCase();
    if (!item.name.toLowerCase().includes(q)) return false;
  }
  return true;
});
```

### 14.4 색상/테마 수정

1. `src/index.css`에서 CSS 변수 값을 변경
2. HSL 형식으로 입력 (예: `185 72% 48%`)
3. `:root`(라이트)와 `.dark`(다크) 둘 다 수정

### 14.5 사이드바 메뉴 순서 변경

`ERPSidebar.tsx`의 `menuItems` 배열 순서를 변경하면 됩니다. 하위 메뉴는 `children` 배열 순서를 변경합니다.

---

## 15. 알아두면 좋은 것들

### 15.1 `cn()` 유틸리티

Tailwind 클래스를 조건부로 병합할 때 사용합니다:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base-class",                           // 항상 적용
  isActive && "bg-primary text-white",     // 조건부 적용
  className                                // 외부에서 전달된 클래스
)} />
```

### 15.2 아이콘 사용법

```tsx
import { Factory, Search, Plus } from "lucide-react";

<Factory className="w-4 h-4" />           // 크기 지정
<Search className="w-4 h-4 text-primary" /> // 색상 지정
```

아이콘 목록: https://lucide.dev/icons

### 15.3 파일 수정 시 주의사항

- `src/components/ui/` 폴더의 파일은 shadcn/ui 라이브러리 파일이므로 **가급적 수정하지 않는 것이 좋습니다** (`date-picker.tsx`는 커스텀이므로 수정 가능)
- 새 UI 컴포넌트가 필요하면 `src/components/erp/` 폴더에 추가하세요
- 각 페이지는 독립적이므로, 한 페이지를 수정해도 다른 페이지에 영향이 없습니다

### 15.4 빌드 에러 대응

```bash
npm run build
```

자주 발생하는 에러:
- **Cannot find name 'XXX'**: import 누락 → 해당 컴포넌트/함수를 import에 추가
- **Type 'X' is not assignable to type 'Y'**: TypeScript 타입 불일치 → 타입 캐스팅 또는 수정
- **Module not found**: 파일 경로 오류 → `@/` 경로 확인

### 15.5 전표 상태 코드 정리

**생산(製造購買) 전표**:

| 코드 | 일본어 | 의미 |
|------|--------|------|
| S00 | 作成中 | 작성중 |
| S01 | 申請中 | 신청중 |
| A00 | 承認中 | 승인 대기 |
| A01 | 承認済 | 승인 완료 |
| A02 | 否認 | 거부 |
| P00 | 差戻中 | 반려 |
| P01 | 見積中 | 견적중 |
| P02 | 発注済 | 발주 완료 |
| P03 | 分納中 | 분납중 |
| P04 | 入庫済 | 입고 완료 |
| I00 | 検収済 | 검수 완료 |

**출고(出庫) 전표**:

| 코드 | 일본어 | 의미 |
|------|--------|------|
| S00 | 作成中 | 작성중 |
| S01 | 申請中 | 신청중 |
| A00 | 承認中 | 승인 대기 |
| A01 | 承認済 | 승인 완료 |
| A02 | 否認 | 거부 |
| T01 | 積送中 | 적송(운송)중 |
| T02 | 出庫済 | 출고 완료 |
| T03 | 売上確定 | 매출 확정 |
| T04 | 在庫調整 | 재고 조정 |

---

## 부록: 파일별 핵심 코드 위치

| 찾고 싶은 것 | 파일 | 위치 |
|-------------|------|------|
| URL → 페이지 매핑 | `App.tsx` | `<Routes>` 블록 |
| 사이드바 메뉴 항목 | `ERPSidebar.tsx` | `menuItems` 배열 |
| 색상/테마 변수 | `index.css` | `:root` 및 `.dark` |
| 로그인 로직 | `use-auth.tsx` | `login()` 함수 |
| 테마 토글 | `use-theme.tsx` | `toggleTheme()` |
| 전체 레이아웃 | `ERPLayout.tsx` | 전체 파일 |
| 알림 패널 | `ERPLayout.tsx` | `mockNotifications` |
| Tailwind 커스텀 설정 | `tailwind.config.ts` | `theme.extend` |
| 글꼴 크기 오버라이드 | `index.css` | `@layer base` |

---

> **문의사항이 있으면 이 문서의 해당 섹션을 먼저 확인하고, 그래도 해결되지 않으면 코드 내 주석이나 컴포넌트 구조를 참고하세요.**
