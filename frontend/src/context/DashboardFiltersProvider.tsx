import { useCallback, useMemo, type ReactNode } from "react"
import { useSearchParams } from "react-router-dom"
import {
  FILTER_PARAM_KEYS,
  getActiveFilterLabels,
  isDefaultFilters,
  parseFilterParams,
  toCatalogFilters,
} from "@/config/filters"
import { DashboardFiltersContext } from "@/context/DashboardFiltersContext"
import type { DashboardFiltersValue } from "@/context/DashboardFiltersContext"
import type {
  ContentFormatFilter,
  CountryFilter,
  MaturityRatingFilter,
  ReleasePeriodFilter,
} from "@/types/filters"

/**
 * Global tactical filters shared by every view and hook.
 * Selections live in URL search params so links stay shareable and any
 * component can react to filter changes when FastAPI is connected.
 */
export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const params = useMemo(() => parseFilterParams(searchParams), [searchParams])

  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous)
          if (value === "all") {
            next.delete(key)
          } else {
            next.set(key, value)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const setFormat = useCallback(
    (value: ContentFormatFilter) => setParam(FILTER_PARAM_KEYS.format, value),
    [setParam],
  )
  const setPeriod = useCallback(
    (value: ReleasePeriodFilter) => setParam(FILTER_PARAM_KEYS.period, value),
    [setParam],
  )
  const setRating = useCallback(
    (value: MaturityRatingFilter) => setParam(FILTER_PARAM_KEYS.rating, value),
    [setParam],
  )
  const setCountry = useCallback(
    (value: CountryFilter) => setParam(FILTER_PARAM_KEYS.country, value),
    [setParam],
  )
  const clearFilters = useCallback(() => {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        for (const paramKey of Object.values(FILTER_PARAM_KEYS)) {
          next.delete(paramKey)
        }
        return next
      },
      { replace: true },
    )
  }, [setSearchParams])

  const value = useMemo<DashboardFiltersValue>(
    () => ({
      format: params.format,
      period: params.period,
      rating: params.rating,
      country: params.country,
      catalogFilters: toCatalogFilters(params),
      activeFilterLabels: getActiveFilterLabels(params),
      hasActiveFilters: !isDefaultFilters(params),
      setFormat,
      setPeriod,
      setRating,
      setCountry,
      clearFilters,
    }),
    [params, setFormat, setPeriod, setRating, setCountry, clearFilters],
  )

  return (
    <DashboardFiltersContext.Provider value={value}>
      {children}
    </DashboardFiltersContext.Provider>
  )
}
