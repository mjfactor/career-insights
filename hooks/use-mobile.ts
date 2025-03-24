import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined'

export function useIsMobile() {
  // Initialize with false for SSR
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  // Only run on client-side
  React.useEffect(() => {
    if (!isClient) return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Add event listener
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
