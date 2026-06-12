/**
 * マスタデータ専用 擬似バックエンドストア
 * - localStorage に永続化 (品目 / 社員 / 拠点)
 * - 全 mutation は 300〜500ms の人為的遅延を挿入し、本物の API 風の UX を再現
 * - React 側は useSyncExternalStore で購読 (use-master-store.tsx)
 *
 * 設計思想:
 *   いずれ実装される C# Web API に差し替えやすいよう、
 *   引数 / 戻り値の形を service.ts と揃えている。
 */

import {
  mockEmployees,
  mockItems,
  mockLocations,
  type MockEmployee,
  type MockItem,
  type MockLocation,
} from "./mock-data";

export type EmployeeRow = MockEmployee;
export type ItemRow = MockItem;
export type LocationRow = MockLocation;

type Entity = "employees" | "items" | "locations";

const STORAGE_KEYS: Record<Entity, string> = {
  employees: "erp_master_employees_v1",
  items: "erp_master_items_v1",
  locations: "erp_master_locations_v1",
};

/** API 呼び出し風の遅延 (300〜500ms) */
const simulateLatency = () =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, 300 + Math.floor(Math.random() * 200))
  );

function load<T>(key: string, seed: T[]): T[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    }
  } catch {}
  try {
    window.localStorage.setItem(key, JSON.stringify(seed));
  } catch {}
  return seed;
}

function persist<T>(key: string, data: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/** 汎用ストアファクトリ */
function createStore<T extends Record<string, any>>(
  entity: Entity,
  seed: T[],
  idKey: keyof T
) {
  let state: T[] = load<T>(STORAGE_KEYS[entity], seed);
  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((l) => l());
  const save = () => persist(STORAGE_KEYS[entity], state);

  const nextId = (): number => {
    const ids = state.map((row) => Number(row[idKey])).filter((n) => !isNaN(n));
    return ids.length === 0 ? 1 : Math.max(...ids) + 1;
  };

  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot: () => state,

    async list(): Promise<T[]> {
      await simulateLatency();
      return state;
    },

    async create(input: Omit<T, typeof idKey> & Partial<Pick<T, typeof idKey>>): Promise<T> {
      await simulateLatency();
      const row = { ...(input as T), [idKey]: input[idKey] ?? nextId() } as T;
      state = [row, ...state];
      save();
      emit();
      return row;
    },

    async update(id: number, patch: Partial<T>): Promise<T | undefined> {
      await simulateLatency();
      let updated: T | undefined;
      state = state.map((row) => {
        if (Number(row[idKey]) !== id) return row;
        updated = { ...row, ...patch };
        return updated;
      });
      save();
      emit();
      return updated;
    },

    async remove(id: number): Promise<void> {
      await simulateLatency();
      state = state.filter((row) => Number(row[idKey]) !== id);
      save();
      emit();
    },

    reset() {
      state = [...seed];
      save();
      emit();
    },
  };
}

export const itemStore = createStore<ItemRow>("items", mockItems, "itemId");
export const employeeStore = createStore<EmployeeRow>("employees", mockEmployees, "empId");
export const locationStore = createStore<LocationRow>("locations", mockLocations, "locId");