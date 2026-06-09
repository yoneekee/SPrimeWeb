/**
 * フロントエンド専用の擬似バックエンドストア
 * - localStorage に永続化
 * - 全ページ共通の slip 一覧 / ワークフロー履歴を保持
 * - useSyncExternalStore で React と同期
 *
 * 本物の C# バックエンドが用意できるまでの代替として、承認プロセスや
 * 伝票作成などの「書き込み系」操作を全て frontend だけで完結させる。
 */

import { mockSlips, type MockSlipRecord } from "./mock-data";

export interface WorkflowEntry {
  stepNo: number;
  status: string;
  empName: string;
  role: string;
  comment: string;
  procAt: string;
}

export interface SlipFull extends MockSlipRecord {
  workflow: WorkflowEntry[];
}

const STORAGE_KEY = "erp_slip_store_v1";
const CURRENT_USER = { empName: "田中 太郎", role: "システム利用者" };

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function seed(): SlipFull[] {
  return mockSlips.map((s) => {
    const workflow: WorkflowEntry[] = [];
    if (s.status !== "S00") {
      workflow.push({
        stepNo: 1,
        status: "申請",
        empName: s.requester,
        role: "申請者",
        comment: "伝票を申請しました",
        procAt: `${s.date} 09:00:00`,
      });
    }
    if (s.approver !== "-" && !["S00", "S01"].includes(s.status)) {
      workflow.push({
        stepNo: workflow.length + 1,
        status: s.status === "A02" ? "否認" : "承認",
        empName: s.approver,
        role: "承認者",
        comment: s.status === "A02" ? "否認しました" : "承認しました",
        procAt: `${s.date} 11:00:00`,
      });
    }
    return { ...s, workflow };
  });
}

function load(): SlipFull[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SlipFull[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  const s = seed();
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  return s;
}

let state: SlipFull[] = load();
const listeners = new Set<() => void>();

function persist() {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function emit() { listeners.forEach((l) => l()); }

export const slipStore = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
  getSnapshot(): SlipFull[] { return state; },

  get(slipNo: string): SlipFull | undefined {
    return state.find((s) => s.slipNo === slipNo);
  },

  add(slip: SlipFull) {
    state = [slip, ...state];
    persist(); emit();
  },

  /** ステータス変更 + ワークフロー履歴の追加 */
  changeStatus(
    slipNo: string,
    newStatus: string,
    workflowLabel: string,
    comment: string,
    actor?: { empName?: string; role?: string }
  ) {
    state = state.map((s) => {
      if (s.slipNo !== slipNo) return s;
      const entry: WorkflowEntry = {
        stepNo: s.workflow.length + 1,
        status: workflowLabel,
        empName: actor?.empName ?? CURRENT_USER.empName,
        role: actor?.role ?? CURRENT_USER.role,
        comment: comment || "-",
        procAt: nowStamp(),
      };
      return { ...s, status: newStatus, workflow: [...s.workflow, entry] };
    });
    persist(); emit();
  },

  reset() {
    state = seed();
    persist(); emit();
  },
};

/** 生産伝票のワークフロー遷移定義 */
export const PROD_TRANSITIONS: Record<string, { next: string; label: string }> = {
  apply:    { next: "A00", label: "申請" },
  approve:  { next: "P01", label: "承認" },
  reject:   { next: "A02", label: "否認" },
  return:   { next: "S00", label: "差戻" },
  order:    { next: "P02", label: "発注確定" },
  partial:  { next: "P03", label: "分納入庫" },
  receive:  { next: "P04", label: "入庫完了" },
  inspect:  { next: "I00", label: "検収完了" },
};

/** 出庫伝票のワークフロー遷移定義 */
export const SHIP_TRANSITIONS: Record<string, { next: string; label: string }> = {
  apply:     { next: "A00", label: "出庫申請" },
  approve:   { next: "A01", label: "承認" },
  reject:    { next: "A02", label: "否認" },
  transit:   { next: "T01", label: "配送開始" },
  delivered: { next: "T02", label: "出庫完了" },
  invoiced:  { next: "T03", label: "売上確定" },
  adjust:    { next: "T04", label: "在庫調整" },
};

/** 新規伝票番号採番 */
export function generateSlipNo(prefix: "SLP" | "SHP"): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const sameDay = state.filter((s) => s.slipNo.startsWith(`${prefix}${dateStr}`)).length + 1;
  return `${prefix}${dateStr}-${String(sameDay).padStart(3, "0")}`;
}