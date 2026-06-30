import * as React from "react"
import { useClientHydrated } from "@/hooks/use-client-hydrated"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const hydrated = useClientHydrated()

  const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT

  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", callback)
    window.addEventListener("resize", callback)
    return () => {
      mql.removeEventListener("change", callback)
      window.removeEventListener("resize", callback)
    }
  }

  const isMobile = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false,
  )

  return hydrated && isMobile
}
