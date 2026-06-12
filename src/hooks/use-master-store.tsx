import { useSyncExternalStore, useEffect, useState } from "react";
import { itemStore, employeeStore, locationStore } from "@/services/master-store";

/**
 * マスタストア用 React フック
 * - useSyncExternalStore で localStorage 由来の state と同期
 * - 初回マウント時に短い loading 状態を返してスケルトン UI に利用
 */
function useStoreWithLoading<T>(
  subscribe: (cb: () => void) => () => void,
  getSnapshot: () => T[]
) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);
  return { data, loading };
}

export const useItems = () => useStoreWithLoading(itemStore.subscribe, itemStore.getSnapshot);
export const useEmployees = () => useStoreWithLoading(employeeStore.subscribe, employeeStore.getSnapshot);
export const useLocations = () => useStoreWithLoading(locationStore.subscribe, locationStore.getSnapshot);