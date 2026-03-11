# S-PRIME ERP — LLM/Agent Context Document

> **Single Source of Truth** for AI agents working on this codebase.
> Contains all architectural decisions, file mappings, conventions, deployment knowledge, and domain logic needed to make accurate code changes.
>
> Last updated: 2026-03-11

---

## Project Identity

- **Name**: S-PRIME ERP (半導体精密機器 統合管理システム)
- **Domain**: Semiconductor precision equipment manufacturing — production, inventory, logistics, finance
- **UI Language**: Japanese (all labels, placeholders, status texts are in Japanese)
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **State**: Frontend prototype with full service-layer architecture. Mock data mode by default; ready for C# .NET Core backend integration.

---

## Build, Run & Deploy

```bash
npm install && npm run dev   # http://localhost:8080
npm run build                # production build → outputs to `dist/` directory
npm test                     # vitest
```

Path alias: `@/` → `src/`

### Deployment (Netlify / SPA Hosting)

- **Build output directory**: `dist`
- **SPA Routing**: `public/_redirects` contains `/* /index.html 200` — this is **required** for client-side routing to work on Netlify. Without it, direct URL access (e.g., `/production/slips`) returns 404.
- For other hosts (Vercel, Cloudflare Pages), equivalent rewrite rules may be needed.

---

## Architecture Overview

```
main.tsx → ThemeProvider → AuthProvider → App.tsx (BrowserRouter + Routes)
                                            └→ ProtectedRoute wraps all pages except /login
                                                └→ Each page uses <ERPLayout> as shell
                                                    ├── ERPSidebar (left nav)
                                                    │   ├── Desktop: hover-expand with mouse enter/leave
                                                    │   └── Mobile: tap-to-toggle via useIsMobile() hook
                                                    ├── Header bar (search, theme toggle, notifications, user menu)
                                                    │   └── Mobile: hamburger menu (☰) triggers Sheet drawer
                                                    └── {children} = page content
```

### Boot Sequence
1. `main.tsx` renders `<ThemeProvider>` → `<AuthProvider>` → `<App />`
2. `ThemeProvider` (`src/hooks/use-theme.tsx`): reads theme from `localStorage("s-prime-theme")`, toggles `.dark` class on `<html>`
3. `AuthProvider` (`src/hooks/use-auth.tsx`): reads login state from `sessionStorage("erp_logged_in")`. Demo auth — any non-empty username/password succeeds.
4. `App.tsx`: defines all `<Route>` elements. `ProtectedRoute` redirects to `/login` if not authenticated.

### Responsive Navigation (Mobile Fix)

The navigation system uses `useIsMobile()` from `@/hooks/use-mobile` (breakpoint: 768px) to switch behavior:

- **Desktop** (`ERPSidebar.tsx`): Sidebar is collapsed by default. Sub-menus expand on **hover** (`onMouseEnter`/`onMouseLeave`). Sidebar width expands when any group is hovered.
- **Mobile** (`ERPLayout.tsx` + `ERPSidebar.tsx`):
  - Sidebar is hidden; a **hamburger menu icon** (☰) appears in the header.
  - Tapping the hamburger opens a `Sheet` (shadcn/ui drawer) containing the full sidebar.
  - Sub-menus toggle on **tap/click** instead of hover (since mobile has no hover).
  - `ERPSidebar` accepts an `onNavigate` callback; on mobile, clicking a link closes the drawer automatically.
  - Japanese menu labels are fully visible (no truncation) with `w-72` drawer width.

---

## Route → File Mapping (Complete)

| Route | Component | File |
|-------|-----------|------|
| `/login` | Login | `src/pages/Login.tsx` |
| `/` | Index (Dashboard) | `src/pages/Index.tsx` |
| `/company` | CompanyIntro | `src/pages/CompanyIntro.tsx` |
| `/design-system` | DesignSystem | `src/pages/DesignSystem.tsx` |
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

### Design System Page (`/design-system`)

A **live visual reference** at `/design-system` renders every reusable UI component (Buttons, Badges, Inputs, Cards, Modals, Tabs, etc.) with all variants (Primary, Secondary, Outline, Destructive, etc.). This page:
- Serves as a **copy-paste reference** for developers
- Demonstrates proper usage of design tokens and `cn()` utility
- Is accessible without authentication (wrapped in `ERPLayout`)

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
├── types/                       # Centralized type definitions (maps to C# backend DTOs)
│   ├── index.ts                 # Unified re-export
│   ├── slip.types.ts            # Slip types: SlipRecord, SlipDetail, CreateSlipRequest, etc.
│   ├── master.types.ts          # Master data: Employee, Item, Warehouse, Partner + Request types
│   └── api.types.ts             # API wrappers: ApiResponse<T>, PaginatedResponse<T>, ApiError, LoginRequest/Response
│
├── services/                    # API call logic (decoupled from UI components)
│   ├── index.ts                 # Unified re-export
│   ├── api-client.ts            # Centralized HTTP client (fetch + timeout + auth headers + error handling)
│   ├── slip.service.ts          # Slip CRUD + status change APIs
│   ├── master.service.ts        # Employee/Item/Warehouse/Partner CRUD APIs
│   ├── auth.service.ts          # Login/Logout/Token refresh APIs
│   └── mock-data.ts             # Unified mock data file (all mock arrays + TypeScript interfaces)
│
├── hooks/
│   ├── use-auth.tsx             # AuthContext: isLoggedIn, user, login(), logout()
│   ├── use-theme.tsx            # ThemeContext: theme ("light"|"dark"), toggleTheme()
│   ├── use-mobile.tsx           # useIsMobile() — returns true when viewport < 768px
│   ├── use-pagination.tsx       # usePagination() — pagination logic hook
│   ├── use-pdf-download.tsx     # usePdfDownload() — PDF generation & download (single/batch)
│   └── api/                     # React Query data fetching hooks
│       ├── index.ts             # Unified re-export
│       ├── use-slips.tsx        # Slip CRUD hooks
│       ├── use-employees.tsx    # Employee CRUD hooks
│       ├── use-items.tsx        # Item CRUD hooks
│       ├── use-warehouses.tsx   # Warehouse CRUD hooks
│       └── use-partners.tsx     # Partner CRUD hooks
│
├── pages/                       # One file per route
│   ├── Login.tsx
│   ├── Index.tsx                # Dashboard: KPI cards, charts, widgets
│   ├── DesignSystem.tsx         # Live UI component reference page
│   ├── SlipListPage.tsx         # Cross-search production+shipping slips
│   ├── ProductionExecution.tsx  # Production slip detail with status flow
│   ├── ProductionSlipCreate.tsx # New production slip form
│   ├── ShipmentManagement.tsx   # Shipping slip detail with status flow
│   ├── ShipmentSlipCreate.tsx   # New shipping slip form
│   ├── BomProductionSlip.tsx    # BOM production slip list
│   ├── BomSlipCreate.tsx        # New BOM slip with auto BOM expansion
│   ├── FinancialStatements.tsx  # B/S and P/L viewer with PDF export
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
│   │   ├── ERPLayout.tsx        # Shell: sidebar + header + mobile drawer (Sheet)
│   │   ├── ERPSidebar.tsx       # Left nav: hover-expand (desktop) / tap-toggle (mobile)
│   │   ├── KPICard.tsx          # Dashboard KPI card
│   │   ├── DashboardChart.tsx   # Recharts area chart
│   │   ├── CompanyNews.tsx      # News widget
│   │   ├── InventoryStatus.tsx  # Inventory donut chart
│   │   ├── ProductionLine.tsx   # Production line status
│   │   ├── RecentOrders.tsx     # Recent orders table
│   │   ├── SafetyStockAlert.tsx # Safety stock warnings
│   │   ├── SlipStatusChart.tsx  # Slip status pie chart
│   │   ├── StatusFlowStepper.tsx# Visual step indicator for slip workflow
│   │   ├── ItemSelectModal.tsx  # Modal for selecting catalog items
│   │   └── PaginationControls.tsx # Reusable pagination UI
│   │
│   ├── pdf/                     # PDF generation components (@react-pdf/renderer)
│   │   ├── SlipPdfDocument.tsx  # PDF layout for slips (PO/invoice/production/shipment/BOM)
│   │   ├── FinancialStatementPdf.tsx # PDF layout for B/S and P/L financial statements
│   │   ├── pdf-styles.ts        # StyleSheet definitions + NotoSansJP font registration
│   │   ├── pdf-types.ts         # PdfDocumentData, PdfLineItem, PdfDocType, FinancialPdfData
│   │   └── index.ts             # Re-exports
│   │
│   └── ui/                      # shadcn/ui primitives (avoid modifying except date-picker.tsx)
│       ├── date-picker.tsx      # CUSTOM: text input + calendar popover
│       ├── button.tsx, table.tsx, select.tsx, card.tsx, badge.tsx, dialog.tsx, ...
│       └── (40+ files)
│
└── lib/
    ├── utils.ts                 # cn() — clsx + tailwind-merge utility
    ├── constants.ts             # Centralized brand colors, company info, dropdown options
    ├── slip-utils.ts            # Slip status management, slip number generation
    └── format-utils.ts          # Currency, date, number formatting utilities
```

---

## UI & Theme System

### BRAND_HUE — One-Line Theme Change

The accent color for the entire application is controlled by a single constant in `src/lib/constants.ts`:

```typescript
export const BRAND_HUE = 185; // ★ Change this one value to re-theme the entire app
// Examples: 185 = Teal, 220 = Blue, 260 = Purple, 340 = Rose, 30 = Orange
```

To change the brand color:
1. Update `BRAND_HUE` in `src/lib/constants.ts`
2. Update `--primary` / `--accent` / `--ring` H values in `src/index.css` to match

The `BRAND_COLORS` object in the same file provides computed HSL values for light/dark modes.

### Centralized Constants (`src/lib/constants.ts`)

All hardcoded values are centralized here:

| Constant | Purpose |
|----------|---------|
| `BRAND_HUE` | Accent color hue (single-line theme change) |
| `BRAND_COLORS` | Computed HSL values for light/dark modes |
| `COMPANY` | Company name, address, tel, version |
| `API_CONFIG` | Base URL, timeout, mock mode flag |
| `PAGINATION` | Default page size, page size options |
| `DATE_FORMATS` | Display/ISO/API date format strings |
| `TAX_RATE` | Tax rate (0.10 = 10%) |
| `DEPT_OPTIONS` | Department dropdown options |
| `ROLE_OPTIONS` | Role dropdown options |
| `ITEM_TYPE_OPTIONS` | Item category options (原材料/半製品/完成品) |
| `UNIT_OPTIONS` | Unit of measure options (EA/SET/KG/BOX/L) |
| `ACCOUNT_OPTIONS` | Account code options |
| `WAREHOUSE_TYPE_OPTIONS` | Warehouse type options |

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

## Formatting Utilities (`src/lib/format-utils.ts`)

All number/currency/date formatting is centralized. **Never manually format numbers in components** — always use these utilities.

### Currency Formatting (¥ + 3-digit comma separation)

```typescript
import { formatCurrency, formatAmount, formatNumber } from "@/lib/format-utils";

formatCurrency(1500000)      // "¥1,500,000"  — Japanese yen with ¥ prefix
formatAmount(1500000)        // "1,500,000"    — comma-separated, no ¥ symbol
formatNumber(12345)          // "12,345"       — generic number with commas
formatPercent(0.125)         // "12.5%"        — percentage display
```

All functions handle `null`, `undefined`, and `NaN` gracefully (return `"¥0"`, `"0"`, or `"0%"`).

### Date Formatting

```typescript
import { formatDate, formatDateISO, formatDateTime, getTodayISO } from "@/lib/format-utils";

formatDate(new Date())       // "2024/03/07"          — display format
formatDateISO(new Date())    // "2024-03-07"           — API/DB format
formatDateTime(new Date())   // "2024/03/07 14:30"     — with time
getTodayISO()                // "2024-03-07"           — current date for defaults
```

### Text Utilities

```typescript
truncate("Very long text here", 10)  // "Very long..."
formatPhone("0312345678")            // "03-1234-5678"
```

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

```typescript
import { getSlipStatusLabel, getSlipStatusStyle, generateSlipNumber } from "@/lib/slip-utils";

<Badge className={getSlipStatusStyle(status)}>{getSlipStatusLabel(status)}</Badge>

const slipNo = generateSlipNumber("SLP");  // "SLP20240307-001"
```

Key functions:
- `getSlipStatusLabel(code)` — status code → Japanese label
- `getSlipStatusStyle(code)` — Badge CSS class
- `getSlipFlowSteps(type)` — PROD/SHIP workflow steps
- `generateSlipNumber(prefix)` — slip number generation
- `isSlipEditable(code)` — whether slip can be edited
- `isSlipComplete(code)` — whether slip is in final state

### use-pagination.tsx (`src/hooks/use-pagination.tsx`)

```typescript
import { usePagination } from "@/hooks/use-pagination";
import { PaginationControls } from "@/components/erp/PaginationControls";

const pagination = usePagination(filteredData, 10);

return (
  <>
    <Table>{pagination.paged.map(item => <TableRow key={item.id}>...</TableRow>)}</Table>
    <PaginationControls pagination={pagination} />
  </>
);
```

Returns: `paged`, `currentPage`, `totalPages`, `itemsPerPage`, `goToPage(n)`, `nextPage()`, `prevPage()`, `changeItemsPerPage(n)`

### use-pdf-download.tsx (`src/hooks/use-pdf-download.tsx`)

```typescript
import { usePdfDownload } from "@/hooks/use-pdf-download";

const { downloadPdf, downloadMultiplePdfs, isGenerating } = usePdfDownload();
await downloadPdf(pdfData, "SLP20240307-001.pdf");
await downloadMultiplePdfs([pdfData1, pdfData2]);
```

PDF types (`src/components/pdf/pdf-types.ts`):
- `PdfDocumentData`: Slip PDFs — `docType: "po"|"invoice"|"production"|"shipment"|"bom"`
- `FinancialPdfData`: Financial statement PDFs — `reportType: "bs"|"pl"` with sections and totals

> PDF Japanese font uses Google Fonts CDN (`NotoSansJP`). May fail in offline environments.

---

## Key Patterns & Conventions

### Page Structure Pattern

```tsx
import ERPLayout from "@/components/erp/ERPLayout";

const PageName = () => {
  // 1. State declarations
  // 2. Mock data (from src/services/mock-data.ts or inline)
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

### DatePicker Usage

```tsx
import { DatePicker } from "@/components/ui/date-picker";
<DatePicker value="2024-03-07" onChange={(d) => setDate(d ? format(d, "yyyy-MM-dd") : "")} />
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
navigate("/production/execution");
navigate("/production/execution/new");
```

### Styling with cn()

Always use `cn()` from `@/lib/utils` for conditional/merged Tailwind classes:

```tsx
import { cn } from "@/lib/utils";
<div className={cn("p-4 rounded-lg", isActive && "bg-primary text-primary-foreground")} />
```

---

## Mock Data (`src/services/mock-data.ts`)

All mock data is centralized in a single file with TypeScript interfaces. This file serves as the **single swap point** when connecting a real backend.

```typescript
import { mockEmployees, mockItems, mockSlips } from "@/services/mock-data";
```

Note: Some pages may still have inline mock arrays. When migrating, move them to `mock-data.ts`.

---

## Backend Integration Architecture

### Overview

The project is fully architected for C# .NET Core backend integration. The frontend has type safety, centralized API calls, and React Query-based data management.

### Environment Configuration

Environment variables in `.env.local` (see `.env.example`):

```bash
VITE_API_BASE_URL=http://localhost:5000/api  # C# API server address
VITE_API_TIMEOUT=30000                       # Request timeout (ms)
VITE_USE_MOCK_DATA=true                      # true: mock data, false: real API
```

### Architecture Layers

```
Pages (UI) — React components rendering data
   ↓ uses
React Query Hooks (src/hooks/api/) — caching, refetching, mutations
   ↓ calls
Service Layer (src/services/) — domain-specific API methods
   ↓ uses
API Client (src/services/api-client.ts) — HTTP fetch wrapper
   ↓ HTTP requests
C# .NET Core Backend API
```

### Type System (`src/types/`)

All types are centralized and map directly to C# backend DTOs:

```typescript
import type { SlipRecord, CreateSlipRequest, PaginatedResponse } from "@/types";
```

| File | Contents |
|------|----------|
| `slip.types.ts` | `SlipRecord`, `SlipDetail`, `SlipLineItem`, `CreateSlipRequest`, `UpdateSlipRequest`, `ChangeSlipStatusRequest`, `SlipSearchFilter` |
| `master.types.ts` | `Employee`, `EmployeeRequest`, `Item`, `ItemRequest`, `Warehouse`, `WarehouseRequest`, `Partner`, `PartnerRequest`, `MasterSearchFilter` |
| `api.types.ts` | `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`, `LoginRequest`, `LoginResponse`, `RefreshTokenRequest` |

### API Client (`src/services/api-client.ts`)

Central HTTP client handling all requests:

- **Auto auth headers**: Reads JWT from `sessionStorage("auth_token")`, adds `Authorization: Bearer {token}`
- **Timeout support**: Configurable per-request or via `VITE_API_TIMEOUT`
- **Standard error handling**: All errors wrapped in `ApiClientError` with `statusCode` and `apiError`
- **Response unwrapping**: Automatically unwraps `ApiResponse<T>` wrapper, returns `data` directly
- **Query params**: Supports `params` option for GET query parameters

```typescript
const data = await apiClient.get<PaginatedResponse<Item>>("/items", {
  params: { page: 1, pageSize: 10, searchText: "sensor" }
});
```

### Service Layer (`src/services/`)

Each domain has a dedicated service object:

| Service | File | Methods |
|---------|------|---------|
| `slipService` | `slip.service.ts` | `getSlips`, `getSlipDetail`, `createSlip`, `updateSlip`, `deleteSlip`, `changeStatus`, `approveSlip`, `rejectSlip`, `submitSlip` |
| `employeeService` | `master.service.ts` | `getAll`, `getById`, `create`, `update`, `delete` |
| `itemService` | `master.service.ts` | `getAll`, `getById`, `getByCode`, `create`, `update`, `delete`, `getStock` |
| `warehouseService` | `master.service.ts` | `getAll`, `getById`, `create`, `update`, `delete` |
| `partnerService` | `master.service.ts` | `getAll`, `getById`, `create`, `update`, `delete`, `getByType` |
| `authService` | `auth.service.ts` | `login`, `logout`, `refreshToken`, `getCurrentUser` |

### React Query Hooks (`src/hooks/api/`)

```typescript
import { useSlips, useCreateSlip } from "@/hooks/api";

const { data, isLoading, error } = useSlips({ page: 1, pageSize: 10 });
const createMutation = useCreateSlip({
  onSuccess: () => toast.success("伝票が作成されました"),
});
createMutation.mutate({ slipType: "PROD", date: "2024-03-07", ... });
```

Available hooks:
- **Slips**: `useSlips`, `useSlipDetail`, `useCreateSlip`, `useUpdateSlip`, `useDeleteSlip`, `useApproveSlip`, `useRejectSlip`
- **Employees**: `useEmployees`, `useEmployee`, `useCreateEmployee`, `useUpdateEmployee`, `useDeleteEmployee`
- **Items**: `useItems`, `useItem`, `useItemByCode`, `useItemStock`, `useCreateItem`, `useUpdateItem`, `useDeleteItem`
- **Warehouses**: `useWarehouses`, `useWarehouse`, `useCreateWarehouse`, `useUpdateWarehouse`, `useDeleteWarehouse`
- **Partners**: `usePartners`, `usePartner`, `usePartnersByType`, `useCreatePartner`, `useUpdatePartner`, `useDeletePartner`

### C# Backend Expected Response Format

```csharp
// Standard response wrapper
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; }
    public DateTime Timestamp { get; set; }
}

// Pagination response
public class PaginatedResponse<T>
{
    public List<T> Items { get; set; }
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}
```

Example endpoints:
- `GET /api/slips?page=1&pageSize=10` → `ApiResponse<PaginatedResponse<SlipRecord>>`
- `GET /api/slips/{slipNo}` → `ApiResponse<SlipDetail>`
- `POST /api/slips` → `ApiResponse<SlipDetail>`
- `PUT /api/slips/{slipNo}` → `ApiResponse<SlipDetail>`
- `DELETE /api/slips/{slipNo}` → `ApiResponse<void>`
- `PATCH /api/slips/{slipNo}/status` → `ApiResponse<SlipDetail>`

### Authentication Flow

1. Login → backend returns JWT token in `LoginResponse`
2. `auth.service.ts` stores token in `sessionStorage("auth_token")`
3. `api-client.ts` auto-attaches `Authorization: Bearer {token}` to all requests
4. On token expiry → `auth.service.refreshToken()` called

### Error Handling

```typescript
try {
  const data = await slipService.getSlips();
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(`${error.statusCode}: ${error.apiError.message}`);
  }
}

// With React Query:
const { data, error, isLoading } = useSlips();
if (error) return <div>エラー: {error.message}</div>;
```

### Migration Checklist (Mock → Real API)

1. Set `VITE_USE_MOCK_DATA=false` in `.env.local`
2. Remove `useState(mockArray)` from page
3. Import appropriate `use*` hook from `@/hooks/api`
4. Handle `isLoading` and `error` states
5. Access data via `PaginatedResponse` structure (`data.items`, `data.totalCount`)
6. Use mutation hooks for create/update/delete
7. Add toast notifications in `onSuccess`/`onError` callbacks

---

## Dependencies (key ones)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-router-dom | ^6.30.1 | Client routing |
| @tanstack/react-query | ^5.83.0 | Async state / API hooks |
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

### Change theme accent color
1. Edit `BRAND_HUE` in `src/lib/constants.ts` (e.g., `185` → `260`)
2. Update H value in `--primary`, `--accent`, `--ring` in `src/index.css` to match

### Add a new UI component
Place domain components in `src/components/erp/`. Use shadcn/ui primitives from `src/components/ui/` as building blocks. Reference `/design-system` page for examples.

### Modify table columns
Each page's table is self-contained. Find `<TableHead>` and `<TableCell>` elements in the relevant page file.

---

## Important Constraints

1. **All UI text must be in Japanese** — maintain consistency with existing labels
2. **No raw color classes** — use semantic tokens (`bg-primary`, `text-muted-foreground`, etc.)
3. **Don't modify `src/components/ui/*`** except `date-picker.tsx` — these are shadcn/ui library files
4. **Every page wraps content in `<ERPLayout>`** — this provides sidebar, header, and consistent styling
5. **Use `cn()` for conditional classes** — always use `cn()` from `@/lib/utils` for class merging
6. **Use format-utils for all formatting** — never manually format currencies or dates in components
7. **Use constants from `src/lib/constants.ts`** — never hardcode brand colors, dropdown options, or company info
8. **Font size minimum**: Due to Japanese readability override, sizes below 14px render as 14px
9. **`public/_redirects` must exist** — required for SPA routing on Netlify deployment
10. **Mock data in `src/services/mock-data.ts`** — centralize all mock data for easy backend swap

---
