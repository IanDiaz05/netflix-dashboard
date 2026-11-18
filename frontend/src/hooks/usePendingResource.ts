import { useEffect, useState } from "react"

export interface AsyncResourceState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

/**
 * Runs an async factory once on mount and tracks loading / error state.
 * Unresolved stub promises keep `isLoading` true indefinitely.
 */
export function usePendingResource<T>(
  factory: () => Promise<T>,
): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: null,
    error: null,
    isLoading: true,
  })

  useEffect(() => {
    let cancelled = false

    void factory()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, isLoading: false })
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          const error =
            caught instanceof Error ? caught : new Error("Unknown request error")
          setState({ data: null, error, isLoading: true })
        }
      })

    return () => {
      cancelled = true
    }
    // Intentionally run once on mount; stub services keep the promise pending.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
