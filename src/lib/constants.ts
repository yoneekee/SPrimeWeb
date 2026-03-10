/**
 * ============================================================
 * 中央化されたアプリケーション定数
 * ============================================================
 *
 * ブランドカラー、テーマ、共通設定値を一元管理します。
 *
 * ## テーマカラーの変更方法（1行で完了）
 *
 * アクセントカラー(Sapphire)を変更したい場合:
 *   1. 下記の `BRAND_HUE` の値を変更する (例: 185 → 260 でパープル)
 *   2. `src/index.css` の `--primary` / `--accent` / `--ring` の H値を同じ値に変更
 *
 * これだけで全コンポーネントのアクセントカラーが一括変更されます。
 */

// ========================================
// ブランドカラー HSL定義
// ========================================

/**
 * ★ アクセントカラーの色相（Hue）— ここを変えるだけでブランド全体が変わる
 *
 * 例: 185 = Teal(現在), 220 = Blue, 260 = Purple, 340 = Rose, 30 = Orange
 */
export const BRAND_HUE = 185;

/** ブランドカラーのHSL値マップ */
export const BRAND_COLORS = {
  /** ライトモード用 primary */
  primaryLight: `${BRAND_HUE} 72% 38%`,
  /** ダークモード用 primary */
  primaryDark: `${BRAND_HUE} 72% 48%`,
} as const;

// ========================================
// 会社情報
// ========================================

export const COMPANY = {
  name: "S-Prime Corp.",
  nameJa: "エスプライム株式会社",
  address: "〒150-0002 東京都渋谷区",
  tel: "TEL: 03-XXXX-XXXX",
  version: "v1.0.0",
} as const;

// ========================================
// API・環境設定
// ========================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  isMock: import.meta.env.VITE_USE_MOCK_DATA === "true",
} as const;

// ========================================
// ページネーション
// ========================================

export const PAGINATION = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 15, 20, 50] as const,
} as const;

// ========================================
// 日付フォーマット
// ========================================

export const DATE_FORMATS = {
  display: "yyyy/MM/dd",
  displayTime: "yyyy/MM/dd HH:mm",
  iso: "yyyy-MM-dd",
  api: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ========================================
// 税率
// ========================================

export const TAX_RATE = 0.10;

// ========================================
// ドロップダウンオプション（共通マスタ）
// ========================================

/** 部署オプション */
export const DEPT_OPTIONS = [
  { code: "MFG1", name: "製造1課" },
  { code: "MFG2", name: "製造2課" },
  { code: "MGT", name: "経営管理課" },
  { code: "LOG", name: "物流課" },
  { code: "QC", name: "品質管理課" },
  { code: "ACC", name: "経理課" },
] as const;

/** 権限種別オプション */
export const ROLE_OPTIONS = [
  { code: "APPROVER", name: "承認者" },
  { code: "PROD", name: "製造担当" },
  { code: "INSP", name: "検収担当" },
] as const;

/** 品目分類オプション */
export const ITEM_TYPE_OPTIONS = [
  { code: "RAW", name: "原材料" },
  { code: "SEMI", name: "半製品" },
  { code: "FIN", name: "完成品" },
] as const;

/** 管理単位オプション */
export const UNIT_OPTIONS = ["EA", "SET", "KG", "BOX", "L"] as const;

/** 勘定科目オプション */
export const ACCOUNT_OPTIONS = [
  { code: "1101", name: "原材料" },
  { code: "1102", name: "半製品（仕掛品）" },
  { code: "1103", name: "完成品（製品）" },
] as const;

/** 倉庫種別オプション */
export const WAREHOUSE_TYPE_OPTIONS = [
  { code: "FACTORY", name: "工場（FACTORY）" },
  { code: "STORE", name: "倉庫（STORE）" },
  { code: "TRANSIT", name: "積送（TRANSIT）" },
  { code: "VENDOR", name: "取引先（VENDOR）" },
] as const;
