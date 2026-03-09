/**
 * 포맷팅 유틸리티 함수 모음
 * 
 * 사용법:
 *   import { formatCurrency, formatDate, formatNumber } from "@/lib/format-utils";
 *   <span>{formatCurrency(1500000)}</span> → "¥1,500,000"
 *   <span>{formatDate(new Date())}</span> → "2024/03/07"
 */

import { format as dateFnsFormat, parseISO } from "date-fns";

// ========================================
// 금額 포맷팅
// ========================================

/**
 * 金額を日本円形式でフォーマット (¥1,234,567)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "¥0";
  return `¥${amount.toLocaleString("ja-JP")}`;
}

/**
 * 金額を日本円形式でフォーマット (¥記号なし、1,234,567)
 */
export function formatAmount(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return "0";
  return amount.toLocaleString("ja-JP");
}

// ========================================
// 数値 포맷팅
// ========================================

/**
 * 数値をカンマ区切りでフォーマット (1,234,567)
 */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "0";
  return value.toLocaleString("ja-JP");
}

/**
 * パーセント表示 (0.125 → "12.5%")
 */
export function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value == null || isNaN(value)) return "0%";
  return `${(value * 100).toFixed(decimals)}%`;
}

// ========================================
// 日付 포맷팅
// ========================================

/**
 * 日付を "2024/03/07" 形式でフォーマット
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return dateFnsFormat(d, "yyyy/MM/dd");
  } catch {
    return "";
  }
}

/**
 * 日付を "2024-03-07" 形式でフォーマット (API/DB用)
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return dateFnsFormat(d, "yyyy-MM-dd");
  } catch {
    return "";
  }
}

/**
 * 日付時刻を "2024/03/07 14:30" 形式でフォーマット
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return dateFnsFormat(d, "yyyy/MM/dd HH:mm");
  } catch {
    return "";
  }
}

/**
 * 現在日付を "2024-03-07" 形式で取得 (初期値用)
 */
export function getTodayISO(): string {
  return dateFnsFormat(new Date(), "yyyy-MM-dd");
}

// ========================================
// テキスト処理
// ========================================

/**
 * 長いテキストを省略表示 ("This is a very long..." 形式)
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * 電話番号をフォーマット ("0312345678" → "03-1234-5678")
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}
