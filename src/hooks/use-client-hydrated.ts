"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

export function useClientHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
