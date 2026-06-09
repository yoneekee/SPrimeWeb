import { useSyncExternalStore } from "react";
import { slipStore } from "@/services/mock-store";

/** ストア全体を購読 (再レンダリング付き) */
export const useSlips = () =>
  useSyncExternalStore(
    slipStore.subscribe,
    slipStore.getSnapshot,
    slipStore.getSnapshot
  );