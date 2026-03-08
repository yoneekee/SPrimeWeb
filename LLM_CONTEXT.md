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
├── hooks/
│   ├── use-auth.tsx             # AuthContext: isLoggedIn, user, login(), logout()
│   ├── use-theme.tsx            # ThemeContext: theme ("light"|"dark"), toggleTheme()
│   └── use-mobile.tsx           # useIsMobile() hook
│
├── pages/                       # One file per route (self-contained with mock data)
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
│   │   ├── ERPLayout.tsx        # Shell: sidebar + header + main content + notifications + user menu + settings modal
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
│   │   └── ItemSelectModal.tsx  # Modal for selecting catalog items (used in slip creation)
│   │
│   └── ui/                      # shadcn/ui primitives (avoid modifying except date-picker.tsx)
│       ├── date-picker.tsx      # CUSTOM: text input + calendar popover, supports string/Date values
│       ├── button.tsx, table.tsx, select.tsx, card.tsx, badge.tsx, dialog.tsx, calendar.tsx, popover.tsx, ...
│       └── (40+ files)
│
└── lib/
    └── utils.ts                 # cn() — clsx + tailwind-merge utility
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
| @tanstack/react-query | ^5.83.0 | Async state (installed, not actively used yet) |
| recharts | ^2.15.4 | Charts on dashboard |
| date-fns | ^3.6.0 | Date formatting/parsing |
| lucide-react | ^0.462.0 | Icons |
| react-day-picker | ^8.10.1 | Calendar component |
| zod | ^3.25.76 | Schema validation |
| react-hook-form | ^7.61.1 | Form management |
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
