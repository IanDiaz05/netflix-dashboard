import { useCallback, useEffect, useRef, useState } from "react"

export interface AsyncResourceState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

export interface PendingResource<T> extends AsyncResourceState<T> {
  /** Re-runs the factory and returns the resource to its loading state. */
  retry: () => void
}

/**
 * Runs an async factory on mount and whenever `dependencies` change or
 * `retry` is called, tracking loading / error state.
 * Unresolved stub promises keep `isLoading` true indefinitely.
 * The factory identity is ignored; its latest closure is kept in a ref, so
 * callers may pass inline factories as long as `dependencies` cover every
 * value the factory closes over (e.g. resolved catalog filters).
 */
export function usePendingResource<T>(
  factory: () => Promise<T>,
  dependencies: readonly unknown[] = [],
): PendingResource<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: null,
    error: null,
    isLoading: true,
  })
  const [attempt, setAttempt] = useState(0)
  const factoryRef = useRef(factory)

  useEffect(() => {
    factoryRef.current = factory
  })

  const retry = useCallback(() => {
    setAttempt((current) => current + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    void factoryRef.current()
      .then((data) => {
        if (!cancelled) {
          setState({ data, error: null, isLoading: false })
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          const error =
            caught instanceof Error ? caught : new Error("Unknown request error")
          setState({ data: null, error, isLoading: false })
        }
      })

    return () => {
      cancelled = true
      // Reset before the next run so stale data never renders under new inputs.
      setState({ data: null, error: null, isLoading: true })
    }
    // The factory is intentionally excluded; `dependencies` cover its inputs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt, ...dependencies])

  return { ...state, retry }
}
