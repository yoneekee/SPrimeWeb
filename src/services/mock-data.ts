/**
 * ============================================================
 * 統合モックデータ (mock-data.ts)
 * ============================================================
 *
 * 目的: 全ページで使われるモックデータを一箇所に集約。
 * API連携時はこのファイル内のデータを API 呼び出しに差し替えるだけで済みます。
 *
 * 使い方:
 *   import { mockEmployees, mockItems } from "@/services/mock-data";
 */

// ========================================
// 社員マスタ
// ========================================

export interface MockEmployee {
  empId: number;
  loginId: string;
  empName: string;
  deptCode: string;
  deptName: string;
  roleType: string;
  roleName: string;
  email: string;
  isActive: boolean;
  remarks: string;
}

export const mockEmployees: MockEmployee[] = [
  { empId: 1001, loginId: "tanaka.t", empName: "田中 太郎", deptCode: "MFG1", deptName: "製造1課", roleType: "PROD", roleName: "製造担当", email: "tanaka.t@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1002, loginId: "suzuki.h", empName: "鈴木 花子", deptCode: "MGT", deptName: "経営管理課", roleType: "APPROVER", roleName: "承認者", email: "suzuki.h@sprime.co.jp", isActive: true, remarks: "一次承認権限" },
  { empId: 1003, loginId: "sato.k", empName: "佐藤 健一", deptCode: "MGT", deptName: "経営管理課", roleType: "APPROVER", roleName: "承認者", email: "sato.k@sprime.co.jp", isActive: true, remarks: "二次承認権限" },
  { empId: 1004, loginId: "yamada.y", empName: "山田 裕子", deptCode: "MFG2", deptName: "製造2課", roleType: "PROD", roleName: "製造担当", email: "yamada.y@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1005, loginId: "ito.m", empName: "伊藤 真一", deptCode: "LOG", deptName: "物流課", roleType: "PROD", roleName: "物流担当", email: "ito.m@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1006, loginId: "watanabe.r", empName: "渡辺 涼介", deptCode: "QC", deptName: "品質管理課", roleType: "INSP", roleName: "検収担当", email: "watanabe.r@sprime.co.jp", isActive: true, remarks: "" },
  { empId: 1007, loginId: "kobayashi.a", empName: "小林 明", deptCode: "MFG1", deptName: "製造1課", roleType: "PROD", roleName: "製造担当", email: "kobayashi.a@sprime.co.jp", isActive: false, remarks: "2024.02 退職" },
];

// ========================================
// 品目マスタ
// ========================================

export interface MockItem {
  itemId: number;
  itemCode: string;
  itemName: string;
  itemType: string;
  typeName: string;
  spec: string;
  unit: string;
  stdPrice: number;
  planQty: number;
  stockQty: number;
  safetyStock: number;
  acctCode: string;
  isActive: boolean;
}

export const mockItems: MockItem[] = [
  { itemId: 1, itemCode: "RAW-WAFER-300", itemName: "シリコンウェーハ 300mm", itemType: "RAW", typeName: "原材料", spec: "300mm / P-type", unit: "EA", stdPrice: 85000, planQty: 200, stockQty: 300, safetyStock: 100, acctCode: "1101", isActive: true },
  { itemId: 2, itemCode: "RAW-CHEM-AZ", itemName: "フォトレジスト AZ-5214", itemType: "RAW", typeName: "原材料", spec: "1L / UV-grade", unit: "EA", stdPrice: 120000, planQty: 50, stockQty: 80, safetyStock: 30, acctCode: "1101", isActive: true },
  { itemId: 3, itemCode: "RAW-GAS-N2", itemName: "高純度窒素ガス（N2）", itemType: "RAW", typeName: "原材料", spec: "99.999% / 47L", unit: "SET", stdPrice: 45000, planQty: 20, stockQty: 15, safetyStock: 20, acctCode: "1101", isActive: true },
  { itemId: 4, itemCode: "SEMI-CHAMBER-01", itemName: "真空チャンバーモジュール", itemType: "SEMI", typeName: "半製品", spec: "SUS316L / Φ500", unit: "EA", stdPrice: 3500000, planQty: 5, stockQty: 8, safetyStock: 3, acctCode: "1102", isActive: true },
  { itemId: 5, itemCode: "SEMI-RF-GEN", itemName: "RF発生器ユニット", itemType: "SEMI", typeName: "半製品", spec: "13.56MHz / 3kW", unit: "EA", stdPrice: 8200000, planQty: 5, stockQty: 3, safetyStock: 2, acctCode: "1102", isActive: true },
  { itemId: 6, itemCode: "FIN-ETCH-500", itemName: "プラズマエッチング装置 PE-500", itemType: "FIN", typeName: "完成品", spec: "Standard Config", unit: "SET", stdPrice: 45000000, planQty: 0, stockQty: 2, safetyStock: 1, acctCode: "1103", isActive: true },
  { itemId: 7, itemCode: "FIN-CVD-300", itemName: "CVD成膜装置 CV-300", itemType: "FIN", typeName: "完成品", spec: "Standard Config", unit: "SET", stdPrice: 78000000, planQty: 0, stockQty: 8, safetyStock: 2, acctCode: "1103", isActive: true },
  { itemId: 8, itemCode: "RAW-ORING-VT", itemName: "バイトン Oリング（Φ300）", itemType: "RAW", typeName: "原材料", spec: "Viton / Φ300", unit: "EA", stdPrice: 15000, planQty: 0, stockQty: 25, safetyStock: 50, acctCode: "1101", isActive: false },
];

// ========================================
// 倉庫拠点マスタ
// ========================================

export interface MockLocation {
  locId: number;
  locName: string;
  locType: string;
  typeName: string;
  postalCode: string;
  address: string;
  contactInfo: string;
  isActive: boolean;
  remarks: string;
}

export const mockLocations: MockLocation[] = [
  { locId: 1, locName: "本社 第1倉庫", locType: "FACTORY", typeName: "工場", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビルB1F", contactInfo: "03-1234-5678", isActive: true, remarks: "クリーンルーム環境（Class 1000）" },
  { locId: 2, locName: "本社 第2倉庫", locType: "FACTORY", typeName: "工場", postalCode: "150-0002", address: "東京都渋谷区渋谷1-2-3 本社ビル1F", contactInfo: "03-1234-5679", isActive: true, remarks: "一般資材保管" },
  { locId: 3, locName: "渋谷物流センター", locType: "STORE", typeName: "倉庫", postalCode: "150-0041", address: "東京都渋谷区神南2-5-10", contactInfo: "03-9876-5432", isActive: true, remarks: "出荷前ステージング専用" },
  { locId: 4, locName: "平沢FAB納品拠点", locType: "VENDOR", typeName: "取引先", postalCode: "", address: "京畿道平沢市三南面サムスンロ1キル30", contactInfo: "031-000-0000", isActive: true, remarks: "サムスン電子 平沢キャンパス" },
  { locId: 5, locName: "輸送中（積送）", locType: "TRANSIT", typeName: "積送", postalCode: "", address: "輸送中", contactInfo: "-", isActive: true, remarks: "積送品勘定管理用仮想拠点" },
  { locId: 6, locName: "大阪支店倉庫", locType: "FACTORY", typeName: "工場", postalCode: "530-0001", address: "大阪府大阪市北区梅田3-1-1", contactInfo: "06-1111-2222", isActive: false, remarks: "2024.01 閉鎖" },
];

// ========================================
// 伝票一覧
// ========================================

export interface MockSlipRecord {
  slipNo: string;
  slipType: "PROD" | "SHIP";
  typeName: string;
  date: string;
  requester: string;
  department: string;
  approver: string;
  handler: string;
  status: string;
  partner: string;
  totalAmount: number;
  itemCount: number;
}

export const mockSlips: MockSlipRecord[] = [
  { slipNo: "SLP20240307-001", slipType: "PROD", typeName: "製造購買", date: "2024-03-07", requester: "田中 太郎", department: "製造1課", approver: "佐藤 花子", handler: "山田 優子", status: "P03", partner: "東京半導体(株)", totalAmount: 68750000, itemCount: 3 },
  { slipNo: "SLP20240305-003", slipType: "PROD", typeName: "製造購買", date: "2024-03-05", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "高橋 健太", status: "A01", partner: "大阪精密工業(株)", totalAmount: 12300000, itemCount: 2 },
  { slipNo: "SLP20240304-002", slipType: "PROD", typeName: "製造購買", date: "2024-03-04", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "I00", partner: "名古屋電子(株)", totalAmount: 95200000, itemCount: 5 },
  { slipNo: "SLP20240301-001", slipType: "PROD", typeName: "製造購買", date: "2024-03-01", requester: "田中 太郎", department: "製造1課", approver: "-", handler: "-", status: "S00", partner: "-", totalAmount: 0, itemCount: 0 },
  { slipNo: "SLP20240228-005", slipType: "PROD", typeName: "製造購買", date: "2024-02-28", requester: "高橋 健太", department: "資材課", approver: "佐藤 花子", handler: "高橋 健太", status: "P04", partner: "東京半導体(株)", totalAmount: 23400000, itemCount: 4 },
  { slipNo: "SLP20240227-002", slipType: "PROD", typeName: "製造購買", date: "2024-02-27", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "-", status: "A02", partner: "九州ケミカル(株)", totalAmount: 8900000, itemCount: 1 },
  { slipNo: "SLP20240226-004", slipType: "PROD", typeName: "製造購買", date: "2024-02-26", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "P02", partner: "大阪精密工業(株)", totalAmount: 41600000, itemCount: 3 },
  { slipNo: "SLP20240225-001", slipType: "PROD", typeName: "製造購買", date: "2024-02-25", requester: "田中 太郎", department: "製造1課", approver: "佐藤 花子", handler: "山田 優子", status: "I00", partner: "東京半導体(株)", totalAmount: 55000000, itemCount: 2 },
  { slipNo: "SHP20240310-001", slipType: "SHIP", typeName: "出庫", date: "2024-03-10", requester: "高橋 修平", department: "物流課", approver: "佐藤 花子", handler: "山田 優子", status: "T01", partner: "東京エレクトロン(株)", totalAmount: 245000000, itemCount: 3 },
  { slipNo: "SHP20240308-002", slipType: "SHIP", typeName: "出庫", date: "2024-03-08", requester: "高橋 修平", department: "物流課", approver: "鈴木 一郎", handler: "高橋 健太", status: "T03", partner: "SCREEN HD(株)", totalAmount: 156000000, itemCount: 2 },
  { slipNo: "SHP20240306-001", slipType: "SHIP", typeName: "出庫", date: "2024-03-06", requester: "山田 優子", department: "営業課", approver: "田中 太郎", handler: "高橋 修平", status: "T02", partner: "ディスコ(株)", totalAmount: 89500000, itemCount: 1 },
  { slipNo: "SHP20240303-003", slipType: "SHIP", typeName: "出庫", date: "2024-03-03", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "山田 優子", status: "T04", partner: "TSMC Japan", totalAmount: 12800000, itemCount: 2 },
  { slipNo: "SHP20240228-002", slipType: "SHIP", typeName: "出庫", date: "2024-02-28", requester: "高橋 修平", department: "物流課", approver: "佐藤 花子", handler: "高橋 健太", status: "T03", partner: "キヤノン(株)", totalAmount: 178200000, itemCount: 4 },
  { slipNo: "SHP20240225-001", slipType: "SHIP", typeName: "出庫", date: "2024-02-25", requester: "山田 優子", department: "営業課", approver: "田中 太郎", handler: "山田 優子", status: "A01", partner: "ニコン(株)", totalAmount: 67400000, itemCount: 2 },
  { slipNo: "SLP20240222-003", slipType: "PROD", typeName: "製造購買", date: "2024-02-22", requester: "山田 優子", department: "資材課", approver: "佐藤 花子", handler: "高橋 健太", status: "S01", partner: "東京半導体(株)", totalAmount: 15750000, itemCount: 2 },
  { slipNo: "SHP20240222-004", slipType: "SHIP", typeName: "出庫", date: "2024-02-22", requester: "高橋 健太", department: "物流課", approver: "鈴木 一郎", handler: "高橋 修平", status: "T02", partner: "アドバンテスト(株)", totalAmount: 34600000, itemCount: 1 },
  { slipNo: "SLP20240220-002", slipType: "PROD", typeName: "製造購買", date: "2024-02-20", requester: "高橋 健太", department: "資材課", approver: "田中 太郎", handler: "山田 優子", status: "P01", partner: "名古屋電子(株)", totalAmount: 33200000, itemCount: 3 },
  { slipNo: "SHP20240218-003", slipType: "SHIP", typeName: "出庫", date: "2024-02-18", requester: "山田 優子", department: "営業課", approver: "佐藤 花子", handler: "高橋 修平", status: "A02", partner: "東京エレクトロン(株)", totalAmount: 91300000, itemCount: 3 },
  { slipNo: "SLP20240218-001", slipType: "PROD", typeName: "製造購買", date: "2024-02-18", requester: "佐藤 花子", department: "品質管理課", approver: "鈴木 一郎", handler: "高橋 健太", status: "A01", partner: "大阪精密工業(株)", totalAmount: 27800000, itemCount: 2 },
  { slipNo: "SLP20240215-004", slipType: "PROD", typeName: "製造購買", date: "2024-02-15", requester: "鈴木 一郎", department: "製造2課", approver: "田中 太郎", handler: "山田 優子", status: "I00", partner: "東京半導体(株)", totalAmount: 62100000, itemCount: 4 },
];

// ========================================
// 通知
// ========================================

export interface MockNotification {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const mockNotifications: MockNotification[] = [
  { id: "1", type: "success", title: "承認完了", message: "SLP20240307-001 伝票が最終承認されました。", time: "5分前", read: false },
  { id: "2", type: "warning", title: "在庫不足警告", message: "バイトン Oリング（Φ300）が安全在庫以下です。", time: "12分前", read: false },
  { id: "3", type: "info", title: "分納入庫", message: "シリコンウェーハ 300mm 1次分納 300EA 入庫完了。", time: "1時間前", read: true },
  { id: "4", type: "info", title: "新規伝票", message: "伊藤真一さんが出庫伝票 SHP20240310-001を申請しました。", time: "2時間前", read: true },
  { id: "5", type: "success", title: "検収完了", message: "SLP20240304-002 伝票の検収が完了しました。", time: "3時間前", read: true },
];

// ========================================
// 財務諸表
// ========================================

export interface MockAccountRow {
  code: string;
  name: string;
  amount: number;
  ratio: number;
}

export const mockBsAssets: MockAccountRow[] = [
  { code: "1101", name: "原材料", amount: 128500000, ratio: 18.2 },
  { code: "1102", name: "半製品（仕掛品）", amount: 95200000, ratio: 13.5 },
  { code: "1103", name: "製品（完成品）", amount: 312000000, ratio: 44.2 },
  { code: "1104", name: "未着品", amount: 45600000, ratio: 6.5 },
  { code: "1105", name: "積送品", amount: 78300000, ratio: 11.1 },
  { code: "1106", name: "売掛金", amount: 46200000, ratio: 6.5 },
];

export const mockBsLiabilities: MockAccountRow[] = [
  { code: "2101", name: "買掛金", amount: 89400000, ratio: 62.3 },
  { code: "2102", name: "未払金", amount: 54100000, ratio: 37.7 },
];

export const mockPlRevenue: MockAccountRow[] = [
  { code: "4101", name: "売上高", amount: 542000000, ratio: 100.0 },
];

export const mockPlExpenses: MockAccountRow[] = [
  { code: "5101", name: "売上原価", amount: 378500000, ratio: 69.8 },
  { code: "5102", name: "棚卸減耗損", amount: 4200000, ratio: 0.8 },
];

// ========================================
// 請求書/発注書
// ========================================

export interface MockDocItem {
  slipNo: string;
  partner: string;
  itemSummary: string;
  totalAmount: number;
  taxAmount: number;
  issueDate: string;
  printed: boolean;
}

export const mockPO: MockDocItem[] = [
  { slipNo: "PO-20240309-001", partner: "東京半導体(株)", itemSummary: "シリコンウェーハ 300mm 他2件", totalAmount: 75350000, taxAmount: 7535000, issueDate: "2024-03-09", printed: true },
  { slipNo: "PO-20240307-002", partner: "大阪精密(株)", itemSummary: "バイトン Oリング 他1件", totalAmount: 12800000, taxAmount: 1280000, issueDate: "2024-03-07", printed: false },
  { slipNo: "PO-20240305-001", partner: "名古屋素材(株)", itemSummary: "SUS316L ステンレス板材", totalAmount: 34200000, taxAmount: 3420000, issueDate: "2024-03-05", printed: true },
  { slipNo: "PO-20240301-003", partner: "東京半導体(株)", itemSummary: "RF電力制御PCB 他3件", totalAmount: 28900000, taxAmount: 2890000, issueDate: "2024-03-01", printed: false },
];

export const mockInvoice: MockDocItem[] = [
  { slipNo: "INV-20240311-001", partner: "東京エレクトロン(株)", itemSummary: "プラズマエッチング装置 PE-500 他2件", totalAmount: 269500000, taxAmount: 26950000, issueDate: "2024-03-11", printed: true },
  { slipNo: "INV-20240308-002", partner: "SCREEN HD(株)", itemSummary: "CVD成膜装置 CV-300", totalAmount: 171600000, taxAmount: 17160000, issueDate: "2024-03-08", printed: true },
  { slipNo: "INV-20240306-001", partner: "ディスコ(株)", itemSummary: "精密ウェーハチャックモジュール 他1件", totalAmount: 98450000, taxAmount: 9845000, issueDate: "2024-03-06", printed: false },
];

// ========================================
// ダッシュボードチャートデータ
// ========================================

export const mockChartData = [
  { name: "1月", 生産量: 4200, 不良数: 120, 出荷量: 3800 },
  { name: "2月", 生産量: 5100, 不良数: 95, 出荷量: 4600 },
  { name: "3月", 生産量: 4800, 不良数: 140, 出荷量: 4200 },
  { name: "4月", 生産量: 5500, 不良数: 88, 出荷量: 5100 },
  { name: "5月", 生産量: 6200, 不良数: 72, 出荷量: 5800 },
  { name: "6月", 生産量: 5900, 不良数: 105, 出荷量: 5400 },
  { name: "7月", 生産量: 6800, 不良数: 65, 出荷量: 6300 },
];

// ========================================
// ステータスマップ (共通)
// ========================================

export const PRODUCTION_STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "承認中 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "承認済 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "否認 (Rejected)", color: "bg-destructive/20 text-destructive" },
  P00: { label: "差戻中 (Returning)", color: "bg-warning/20 text-warning" },
  P01: { label: "見積中 (Quoted)", color: "bg-primary/20 text-primary" },
  P02: { label: "発注済 (Ordered)", color: "bg-primary/20 text-primary" },
  P03: { label: "分納中 (Partial)", color: "bg-info/20 text-info" },
  P04: { label: "入庫済 (Received)", color: "bg-success/20 text-success" },
  I00: { label: "検収済 (Accepted)", color: "bg-success/20 text-success" },
};

export const SHIPMENT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  S00: { label: "作成中 (Draft)", color: "bg-muted text-muted-foreground" },
  S01: { label: "申請中 (Pending)", color: "bg-info/20 text-info" },
  A00: { label: "承認中 (In-Review)", color: "bg-warning/20 text-warning" },
  A01: { label: "承認済 (Approved)", color: "bg-success/20 text-success" },
  A02: { label: "否認 (Rejected)", color: "bg-destructive/20 text-destructive" },
  T01: { label: "積送中 (Transit)", color: "bg-info/20 text-info" },
  T02: { label: "出庫済 (Delivered)", color: "bg-primary/20 text-primary" },
  T03: { label: "売上確定 (Invoiced)", color: "bg-success/20 text-success" },
  T04: { label: "在庫調整 (Adjusted)", color: "bg-warning/20 text-warning" },
};

/** Combined status map for all slip types */
export const ALL_STATUS_MAP: Record<string, { label: string; color: string }> = {
  ...PRODUCTION_STATUS_MAP,
  ...SHIPMENT_STATUS_MAP,
};
