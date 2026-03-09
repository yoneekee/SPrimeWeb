# S-PRIME ERP — LLM/Agent Context Document

> Single-file context for AI agents working on this codebase. Contains all architectural decisions, file mappings, conventions, and domain knowledge needed to make accurate code changes.

---

## Project Identity

- **Name**: S-PRIME ERP (半導体精密機器 統合管理システム)
- **Domain**: Semiconductor precision equipment manufacturing — production, inventory, logistics, finance
- **UI Language**: Japanese (all labels, placeholders, status texts are in Japanese)
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State**: Frontend-only prototype. All data is mock (hardcoded arrays). No backend/DB.

---

## Build & Run

```bash
npm install && npm run dev   # http://localhost:8080
npm run build                # production build
npm test                     # vitest
```

Path alias: `@/` → `src/`

---

## Architecture Overview

```
main.tsx → ThemeProvider → AuthProvider → App.tsx (BrowserRouter + Routes)
                                            └→ ProtectedRoute wraps all pages except /login
                                                └→ Each page uses <ERPLayout> as shell
                                                    ├── ERPSidebar (left nav, hover-expand)
                                                    ├── Header bar (search, theme toggle, notifications, user menu)
                                                    └── {children} = page content
```

### Boot Sequence
1. `main.tsx` renders `<ThemeProvider>` → `<AuthProvider>` → `<App />`
2. `ThemeProvider` (`src/hooks/use-theme.tsx`): reads theme from `localStorage("s-prime-theme")`, toggles `.dark` class on `<html>`
3. `AuthProvider` (`src/hooks/use-auth.tsx`): reads login state from `sessionStorage("erp_logged_in")`. Demo auth — any non-empty username/password succeeds.
4. `App.tsx`: defines all `<Route>` elements. `ProtectedRoute` redirects to `/login` if not authenticated.

---

## Route → File Mapping (Complete)

| Route | Component | File |
|-------|-----------|------|
| `/login` | Login | `src/pages/Login.tsx` |
| `/` | Index (Dashboard) | `src/pages/Index.tsx` |
| `/company` | CompanyIntro | `src/pages/CompanyIntro.tsx` |
| `/production/slips` | SlipListPage | `src/pages/SlipListPage.tsx` |
| `/production/execution` | ProductionExecution | `src/pages/ProductionExecution.tsx` |
| `/production/execution/new` | ProductionSlipCreate | `src/pages/ProductionSlipCreate.tsx` |
| `/production/shipping` | ShipmentManagement | `src/pages/ShipmentManagement.tsx` |
| `/production/shipping/new` | ShipmentSlipCreate | `src/pages/ShipmentSlipCreate.tsx` |
| `/documents/finance` | FinancialStatements | `src/pages/FinancialStatements.tsx` |
| `/documents/bom` | BomProductionSlip | `src/pages/BomProductionSlip.tsx` |
| `/documents/bom/new` | BomSlipCreate | `src/pages/BomSlipCreate.tsx` |
| `/documents/invoice` | InvoiceManagement | `src/pages/InvoiceManagement.tsx` |
| `/master/employee` | EmployeeMaster | `src/pages/EmployeeMaster.tsx` |
| `/master/item` | ItemMaster | `src/pages/ItemMaster.tsx` |
| `/master/warehouse` | WarehouseMaster | `src/pages/WarehouseMaster.tsx` |
| `/production`, `/documents`, `/master` | PlaceholderPage | `src/pages/PlaceholderPage.tsx` |
| `*` | NotFound | `src/pages/NotFound.tsx` |

---

## Sidebar Menu Structure

Defined in `src/components/erp/ERPSidebar.tsx` → `menuItems` array.

```
会社紹介 (/company)
────────────────────
全体ダッシュボード (/)
生産・製造 ▼
  ├ 生産出庫依頼一覧 (/production/slips)
  ├ 製品生産および実行 (/production/execution)
  └ 出庫および在庫調整 (/production/shipping)
伝票・書類 ▼
  ├ 財務諸表照会 (/documents/finance)
  ├ BOM生産伝票 (/documents/bom)
  └ 請求書・発注書 (/documents/invoice)
マスタ管理 ▼
  ├ 社員マスタ (/master/employee)
  ├ 品目マスタ (/master/item)
  └ 倉庫拠点マスタ (/master/warehouse)
```

To add a menu item: push to `menuItems` array or its `children`.

---

## File Structure

```
src/
├── main.tsx                     # Entry point
├── App.tsx                      # Route definitions + ProtectedRoute
├── index.css                    # Theme CSS variables (light/dark), font overrides, utility classes
│
├── types/                       # 공통 타입 정의 (백엔드 DTO와 매핑)
│   ├── index.ts                 # 통합 export
│   ├── slip.types.ts            # 전표 관련 타입
│   ├── master.types.ts          # 마스터 데이터 타입
│   └── api.types.ts             # API 응답 래퍼 타입
│
├── services/                    # API 호출 로직
│   ├── index.ts                 # 통합 export
│   ├── api-client.ts            # 중앙화된 HTTP 클라이언트
│   ├── slip.service.ts          # 전표 API
│   ├── master.service.ts        # 마스터 데이터 API
│   └── auth.service.ts          # 인증 API
│
├── hooks/
│   ├── use-auth.tsx             # AuthContext: isLoggedIn, user, login(), logout()
│   ├── use-theme.tsx            # ThemeContext: theme ("light"|"dark"), toggleTheme()
│   ├── use-mobile.tsx           # useIsMobile() hook
│   ├── use-pagination.tsx       # usePagination() — 페이지네이션 공통 로직 훅
│   ├── use-pdf-download.tsx     # usePdfDownload() — PDF 생성 및 다운로드 (단건/일괄)
│   └── api/                     # React Query 데이터 fetching 훅
│       ├── index.ts             # 통합 export
│       ├── use-slips.tsx        # 전표 CRUD 훅
│       ├── use-employees.tsx    # 사원 CRUD 훅
│       ├── use-items.tsx        # 품목 CRUD 훅
│       ├── use-warehouses.tsx   # 창고 CRUD 훅
│       └── use-partners.tsx     # 거래처 CRUD 훅
│
├── pages/                       # One file per route (mock data → API 훅으로 전환 준비 완료)
│   ├── Login.tsx
│   ├── Index.tsx                # Dashboard: KPI cards, charts, widgets
│   ├── SlipListPage.tsx         # Cross-search production+shipping slips
│   ├── ProductionExecution.tsx  # Production slip detail with status flow
│   ├── ProductionSlipCreate.tsx # New production slip form
│   ├── ShipmentManagement.tsx   # Shipping slip detail with status flow
│   ├── ShipmentSlipCreate.tsx   # New shipping slip form
│   ├── BomProductionSlip.tsx    # BOM production slip list
│   ├── BomSlipCreate.tsx        # New BOM slip with auto BOM expansion
│   ├── FinancialStatements.tsx  # B/S and P/L viewer
│   ├── InvoiceManagement.tsx    # Invoice/PO management with PDF preview
│   ├── EmployeeMaster.tsx       # Employee CRUD + pagination
│   ├── ItemMaster.tsx           # Item CRUD + pagination
│   ├── WarehouseMaster.tsx      # Warehouse CRUD + pagination
│   ├── CompanyIntro.tsx         # Company info page
│   ├── PlaceholderPage.tsx      # Empty page for unimplemented routes
│   └── NotFound.tsx
│
├── components/
│   ├── erp/                     # Domain-specific components
│   │   ├── ERPLayout.tsx        # Shell: sidebar + sticky header (top-0 z-40) + notifications + user menu + settings modal
│   │   ├── ERPSidebar.tsx       # Left nav with collapsible groups, hover auto-expand
│   │   ├── KPICard.tsx          # Dashboard KPI card
│   │   ├── DashboardChart.tsx   # Recharts area chart
│   │   ├── CompanyNews.tsx      # News widget
│   │   ├── InventoryStatus.tsx  # Inventory donut chart
│   │   ├── ProductionLine.tsx   # Production line status
│   │   ├── RecentOrders.tsx     # Recent orders table
│   │   ├── SafetyStockAlert.tsx # Safety stock warnings
│   │   ├── SlipStatusChart.tsx  # Slip status pie chart
│   │   ├── StatusFlowStepper.tsx# Visual step indicator for slip workflow
│   │   ├── ItemSelectModal.tsx  # Modal for selecting catalog items (used in slip creation)
│   │   └── PaginationControls.tsx # Reusable pagination UI; used with usePagination()
│   │
│   ├── pdf/                     # PDF generation components (@react-pdf/renderer)
│   │   ├── SlipPdfDocument.tsx  # PDF layout for all slip types (PO/invoice/production/shipment/BOM)
│   │   ├── pdf-styles.ts        # StyleSheet definitions + NotoSansJP font registration
│   │   ├── pdf-types.ts         # PdfDocumentData, PdfLineItem, PdfDocType type definitions
│   │   └── index.ts             # Re-exports
│   │
│   └── ui/                      # shadcn/ui primitives (avoid modifying except date-picker.tsx)
│       ├── date-picker.tsx      # CUSTOM: text input + calendar popover, supports string/Date values
│       ├── button.tsx, table.tsx, select.tsx, card.tsx, badge.tsx, dialog.tsx, calendar.tsx, popover.tsx, ...
│       └── (40+ files)
│
└── lib/
    ├── utils.ts                 # cn() — clsx + tailwind-merge utility
    ├── slip-utils.ts            # 전표 상태 관리, 전표 번호 생성 유틸
    └── format-utils.ts          # 금액, 날짜, 숫자 포맷팅 유틸

```

---

## Design System

### Color Tokens (index.css)

All colors use HSL values in CSS variables. Components use semantic Tailwind classes only.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--primary` | `185 72% 38%` | `185 72% 48%` | Main accent (teal) |
| `--background` | `210 20% 96%` | `220 20% 7%` | Page bg |
| `--card` | `0 0% 100%` | `220 18% 10%` | Card bg |
| `--foreground` | `220 20% 14%` | `210 20% 90%` | Main text |
| `--muted-foreground` | `215 12% 46%` | `215 12% 50%` | Secondary text |
| `--success` | `152 60% 38%` | `152 60% 45%` | Success states |
| `--warning` | `38 92% 50%` | `38 92% 50%` | Warnings |
| `--destructive` | `0 72% 51%` | `0 72% 51%` | Errors/delete |
| `--border` | `214 16% 85%` | `220 14% 18%` | Borders |

**Rule**: Never use raw color classes (`bg-red-500`). Always use tokens (`bg-destructive`, `text-primary`).

### Typography

- Body font: `BIZ UDGothic` (Japanese gothic)
- Mono font: `JetBrains Mono` (via `font-mono` class)
- `text-xs` = 14px, `text-sm` = 16px (overridden in tailwind.config.ts for Japanese readability)
- Pixel sizes 8-13px are force-overridden to 14px in index.css

### Tailwind Config (`tailwind.config.ts`)

- Dark mode: class-based (`darkMode: ["class"]`)
- Custom colors mapped from CSS variables (primary, secondary, destructive, muted, accent, success, warning, info, sidebar)
- Border radius from `--radius` variable

---

## Domain Knowledge: Slip Status Codes

### Production Slips (製造購買)

```
S00(作成中) → S01(申請中) → A00(承認中) → A01(承認済) / A02(否認)
                                              ↓
                              P00(差戻中) ← or → P01(見積中) → P02(発注済) → P03(分納中) → P04(入庫済) → I00(検収済)
```

| Code | Japanese | Meaning |
|------|----------|---------|
| S00 | 作成中 | Drafting |
| S01 | 申請中 | Submitted |
| A00 | 承認中 | Pending approval |
| A01 | 承認済 | Approved |
| A02 | 否認 | Rejected |
| P00 | 差戻中 | Returned |
| P01 | 見積中 | Estimating |
| P02 | 発注済 | Ordered |
| P03 | 分納中 | Partial delivery |
| P04 | 入庫済 | Received |
| I00 | 検収済 | Inspected/Complete |

### Shipping Slips (出庫)

```
S00 → S01 → A00 → A01/A02 → T01(積送中) → T02(出庫済) → T03(売上確定)
                                                          → T04(在庫調整)
```

| Code | Japanese | Meaning |
|------|----------|---------|
| T01 | 積送中 | In transit |
| T02 | 出庫済 | Shipped |
| T03 | 売上確定 | Revenue confirmed |
| T04 | 在庫調整 | Inventory adjustment |

---

## Utility Libraries

### slip-utils.ts (`src/lib/slip-utils.ts`)

전표 상태 관리 및 전표 번호 생성 유틸리티:

```typescript
import { getSlipStatusLabel, getSlipStatusStyle, generateSlipNumber } from "@/lib/slip-utils";

// 상태 표시
<Badge className={getSlipStatusStyle(status)}>{getSlipStatusLabel(status)}</Badge>

// 전표 번호 생성
const slipNo = generateSlipNumber("SLP");  // "SLP20240307-001"
const shipNo = generateSlipNumber("SHP");  // "SHP20240307-123"
const bomNo = generateSlipNumber("BOM");   // "BOM20240307-045"
```

주요 함수:
- `getSlipStatusLabel(code)` — 상태 코드 → 일본어 레이블
- `getSlipStatusStyle(code)` — Badge CSS 클래스
- `getSlipFlowSteps(type)` — PROD/SHIP 플로우 단계
- `generateSlipNumber(prefix)` — 전표 번호 생성
- `isSlipEditable(code)` — 편집 가능 여부
- `isSlipComplete(code)` — 완료 상태 여부

### format-utils.ts (`src/lib/format-utils.ts`)

금액, 날짜, 숫자 포맷팅 유틸리티:

```typescript
import { formatCurrency, formatDate, formatNumber } from "@/lib/format-utils";

formatCurrency(1500000)      // "¥1,500,000"
formatAmount(1500000)        // "1,500,000" (¥ 없음)
formatNumber(12345)          // "12,345"
formatPercent(0.125)         // "12.5%"
formatDate(new Date())       // "2024/03/07"
formatDateISO(new Date())    // "2024-03-07"
formatDateTime(new Date())   // "2024/03/07 14:30"
getTodayISO()                // "2024-03-07"
truncate("Very long text", 10) // "Very long..."
formatPhone("0312345678")    // "03-1234-5678"
```

### use-pagination.tsx (`src/hooks/use-pagination.tsx`)

페이지네이션 공통 로직 훅:

```typescript
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/erp/PaginationControls";

const pagination = usePagination(filteredData, 10); // 초기 10건/페이지

return (
  <>
    <Table>
      {pagination.paged.map(item => <TableRow key={item.id}>...</TableRow>)}
    </Table>
    <PaginationControls pagination={pagination} />
  </>
);
```

반환값:
- `paged` — 현재 페이지 데이터
- `currentPage`, `totalPages`, `itemsPerPage` — 페이지 정보
- `goToPage(n)`, `nextPage()`, `prevPage()` — 페이지 이동
- `changeItemsPerPage(n)` — 표시 건수 변경

---

## Key Patterns & Conventions

### Page Structure Pattern

Every page follows this structure:
```tsx
import ERPLayout from "@/components/erp/ERPLayout";

const PageName = () => {
  // 1. State declarations
  // 2. Mock data (const arrays at top of file or above component)
  // 3. Filter/pagination logic
  // 4. Handler functions

  return (
    <ERPLayout>
      <div className="space-y-4">
        <div> {/* Page header: h1 + description */} </div>
        <Card> {/* Search filters */} </Card>
        <Card> {/* Data table with pagination */} </Card>
      </div>
    </ERPLayout>
  );
};
export default PageName;
```

### Pagination Pattern (used in all list pages)

```tsx
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
const totalPages = Math.ceil(filtered.length / itemsPerPage);
const paged = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
// UI: Select dropdown for 5/10/15 items, prev/next buttons
```

### DatePicker Usage

Custom component at `src/components/ui/date-picker.tsx`. Supports text input (auto-formats `20240307` → `2024/03/07`) + calendar popover.

```tsx
import { DatePicker } from "@/components/ui/date-picker";
// String value:
<DatePicker value="2024-03-07" onChange={(d) => setDate(d ? format(d, "yyyy-MM-dd") : "")} />
// Disabled:
<DatePicker value="2024-03-07" disabled />
```

### Status Badge Pattern

```tsx
<Badge className="bg-success/20 text-success">承認済</Badge>
<Badge className="bg-warning/20 text-warning">申請中</Badge>
<Badge className="bg-destructive/20 text-destructive">否認</Badge>
```

### Navigation

```tsx
const navigate = useNavigate();
navigate("/production/execution");       // programmatic navigation
navigate("/production/execution/new");   // go to creation page
```

### Slip Creation Pages

- Use `ItemSelectModal` for adding line items
- Generate slip numbers: `SLP{YYYYMMDD}-{seq}` or `SHP{YYYYMMDD}-{seq}` or `BOM{YYYYMMDD}-{seq}`
- Form fields use controlled state with `useState`

---

## Data Model (Mock)

All data is defined as TypeScript arrays/objects within each page file. No shared data store.

### Common Interfaces

```typescript
// Production/Shipping slip record (SlipListPage.tsx)
interface SlipRecord {
  slipNo: string;        // "SLP20240307-001"
  slipType: "PROD"|"SHIP";
  typeName: string;      // "製造購買" or "出庫"
  date: string;          // "2024-03-07"
  requester: string;     // "田中 太郎"
  department: string;    // "製造1課"
  approver: string;
  handler: string;
  status: string;        // status code like "S00", "A01", "P03"
  partner: string;       // business partner name
  totalAmount: number;
  itemCount: number;
}

// Employee (EmployeeMaster.tsx)
interface Employee { id: number; code: string; name: string; kana: string; dept: string; position: string; joinDate: string; email: string; }

// Item (ItemMaster.tsx)
interface Item { id: number; code: string; name: string; spec: string; category: string; unit: string; price: number; stockQty: number; safetyStock: number; warehouse: string; }

// Warehouse (WarehouseMaster.tsx)
interface Warehouse { id: number; code: string; name: string; type: string; address: string; capacity: number; currentStock: number; manager: string; }
```

### To Connect Real Backend

Replace mock arrays with API calls using `@tanstack/react-query` (already installed):

```tsx
// Before:
const [data] = useState(mockArray);

// After:
const { data } = useQuery({ queryKey: ['items'], queryFn: () => fetch('/api/items').then(r => r.json()) });
```

---

## Dependencies (key ones)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-router-dom | ^6.30.1 | Client routing |
| @tanstack/react-query | ^5.83.0 | Async state / API hooks (서비스 레이어 준비 완료) |
| @react-pdf/renderer | ^4.3.2 | Browser-side PDF generation (NotoSansJP font) |
| recharts | ^2.15.4 | Charts on dashboard |
| date-fns | ^3.6.0 | Date formatting/parsing |
| lucide-react | ^0.462.0 | Icons |
| react-day-picker | ^8.10.1 | Calendar component |
| zod | ^3.25.76 | Schema validation |
| react-hook-form | ^7.61.1 | Form management |
| sonner | ^1.7.4 | Toast notifications |
| tailwindcss | ^3.4.17 | Utility CSS |
| shadcn/ui components | various @radix-ui/* | Accessible UI primitives |

---

## Common Operations Checklist

### Add a new page
1. Create `src/pages/NewPage.tsx` with `<ERPLayout>` wrapper
2. Add route in `App.tsx`: `<Route path="/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />`
3. Add menu entry in `ERPSidebar.tsx` → `menuItems` array

### Add a sidebar submenu item
Edit `menuItems` in `src/components/erp/ERPSidebar.tsx` — push to the relevant parent's `children` array.

### Change theme colors
Edit CSS variables in `src/index.css` — both `:root` (light) and `.dark` (dark) blocks. Values are space-separated HSL: `H S% L%`.

### Add a new UI component
Place domain components in `src/components/erp/`. Use shadcn/ui primitives from `src/components/ui/` as building blocks.

### Modify table columns
Each page's table is self-contained. Find `<TableHead>` and `<TableCell>` elements in the relevant page file.

---

## Important Constraints

1. **All UI text must be in Japanese** — maintain consistency with existing labels
2. **No raw color classes** — use semantic tokens (`bg-primary`, `text-muted-foreground`, etc.)
3. **Don't modify `src/components/ui/*`** except `date-picker.tsx` — these are shadcn/ui library files
4. **Every page wraps content in `<ERPLayout>`** — this provides sidebar, header, and consistent styling
5. **Mock data is per-page** — no shared state store; each page file contains its own data arrays
6. **Font size minimum**: Due to Japanese readability override in index.css, sizes below 14px render as 14px
7. **`cn()` for conditional classes**: Always use `cn()` from `@/lib/utils` for class merging

---

## Backend Integration Architecture

### Overview

프로젝트는 C# .NET Core 백엔드 연동을 위해 완전히 준비되어 있습니다. 프론트엔드는 타입 안전성, 중앙화된 API 호출, React Query 기반 데이터 관리를 갖추고 있습니다.

### Environment Configuration

환경 변수는 `.env.local`에 정의 (`.env.example` 참고):

```bash
VITE_API_BASE_URL=http://localhost:5000/api  # C# API 서버 주소
VITE_API_TIMEOUT=30000                       # 요청 타임아웃 (ms)
VITE_USE_MOCK_DATA=true                      # true: mock 데이터, false: 실제 API
```

### Architecture Layers

```
Pages (UI)
   ↓ 사용
React Query Hooks (src/hooks/api/)
   ↓ 호출
Service Layer (src/services/)
   ↓ 사용
API Client (src/services/api-client.ts)
   ↓ HTTP 요청
C# Backend API
```

### Type System

모든 타입은 `src/types/`에 중앙화:

```typescript
// 사용 예시
import type { SlipRecord, CreateSlipRequest, PaginatedResponse } from "@/types";
```

- `slip.types.ts`: 전표 관련 (SlipRecord, SlipDetail, CreateSlipRequest, ...)
- `master.types.ts`: 마스터 데이터 (Employee, Item, Warehouse, Partner, ...)
- `api.types.ts`: API 응답 래퍼 (ApiResponse<T>, PaginatedResponse<T>, ApiError)

### API Client

`src/services/api-client.ts`는 모든 HTTP 요청을 처리:

- 자동 인증 헤더 추가 (Bearer token from sessionStorage)
- 타임아웃 지원
- 표준 에러 핸들링
- C# 백엔드의 `ApiResponse<T>` 래퍼 자동 unwrap

```typescript
// api-client.ts 내부 사용 예시
const data = await apiClient.get<PaginatedResponse<Item>>("/items", { 
  params: { page: 1, pageSize: 10 } 
});
```

### Service Layer

각 도메인별 서비스 (`src/services/`):

- `slip.service.ts`: 전표 CRUD + 상태 변경
- `master.service.ts`: 사원/품목/창고/거래처 CRUD
- `auth.service.ts`: 로그인/로그아웃/토큰 갱신

```typescript
// 사용 예시 (서비스 직접 호출은 드물고, React Query 훅을 통해 호출)
import { slipService } from "@/services";
const slips = await slipService.getSlips({ page: 1, pageSize: 10 });
```

### React Query Hooks

`src/hooks/api/`의 훅들이 데이터 fetching을 담당:

```typescript
// 페이지에서 사용
import { useSlips, useCreateSlip } from "@/hooks/api";

const { data, isLoading, error } = useSlips({ page: 1, pageSize: 10 });
const createMutation = useCreateSlip({
  onSuccess: () => toast.success("전표가 생성되었습니다"),
});

createMutation.mutate({ slipType: "PROD", date: "2024-03-07", ... });
```

주요 훅:
- **전표**: `useSlips`, `useSlipDetail`, `useCreateSlip`, `useUpdateSlip`, `useDeleteSlip`, `useApproveSlip`, `useRejectSlip`
- **사원**: `useEmployees`, `useEmployee`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`
- **품목**: `useItems`, `useItem`, `useItemByCode`, `useItemStock`, `useCreateItem`, `useUpdateItem`, `useDeleteItem`
- **창고**: `useWarehouses`, `useWarehouse`, `useCreateWarehouse`, `useUpdateWarehouse`, `useDeleteWarehouse`
- **거래처**: `usePartners`, `usePartner`, `usePartnersByType`, `useCreatePartner`, `useUpdatePartner`, `useDeletePartner`

### Mock vs Real Data Toggle

`.env.local`에서 `VITE_USE_MOCK_DATA` 설정:
- `true`: 페이지의 기존 mock 배열 사용
- `false`: React Query 훅으로 실제 API 호출

페이지에서 전환 패턴:

```typescript
// Before (mock):
const [data] = useState(mockArray);

// After (API 연동):
import { useItems } from "@/hooks/api";
const { data: response, isLoading } = useItems({ page: 1, pageSize: 10 });
const data = response?.items || [];

if (isLoading) return <div>Loading...</div>;
```

### C# Backend 요구사항

백엔드는 다음 구조로 응답해야 합니다:

```csharp
// 표준 응답 래퍼
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

// 페이지네이션 응답
public class PaginatedResponse<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

예시 엔드포인트:
- `GET /api/slips?page=1&pageSize=10` → `ApiResponse<PaginatedResponse<SlipRecord>>`
- `GET /api/slips/{slipNo}` → `ApiResponse<SlipDetail>`
- `POST /api/slips` → `ApiResponse<SlipDetail>`
- `PUT /api/slips/{slipNo}` → `ApiResponse<SlipDetail>`
- `DELETE /api/slips/{slipNo}` → `ApiResponse<void>`
- `PATCH /api/slips/{slipNo}/status` → `ApiResponse<SlipDetail>`

### Authentication Flow

1. 로그인 시 백엔드가 JWT 토큰 반환
2. `auth.service.ts`가 sessionStorage에 저장
3. `api-client.ts`가 모든 요청에 `Authorization: Bearer {token}` 헤더 자동 추가
4. 토큰 만료 시 `auth.service.refreshToken()` 호출

```typescript
// 로그인 예시
import { authService } from "@/services";

const response = await authService.login({ username, password });
// → sessionStorage에 token, refreshToken, user 저장
```

### Error Handling

`api-client.ts`는 모든 에러를 `ApiClientError`로 변환:

```typescript
try {
  const data = await slipService.getSlips();
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`${error.statusCode}: ${error.apiError.message}`);
    // error.apiError.details 에 상세 에러 필드별 메시지
  }
}
```

React Query 훅 사용 시:

```typescript
const { data, error, isLoading } = useSlips();

if (error) {
  return <div>에러: {error.message}</div>;
}
```

### Migration Checklist

기존 mock 데이터 페이지를 API 연동으로 전환:

1. `.env.local`에서 `VITE_USE_MOCK_DATA=false` 설정
2. 페이지에서 `useState(mockArray)` 제거
3. 적절한 `use*` 훅 import 및 호출
4. `isLoading`, `error` 상태 처리
5. `PaginatedResponse` 구조에 맞춰 데이터 접근 (`data.items`, `data.totalCount`)
6. Mutation 훅으로 생성/수정/삭제 처리
7. Toast 알림 추가 (`onSuccess`, `onError` 콜백)

---
