import { useContext } from "react"
import {
  DashboardFiltersContext,
  type DashboardFiltersValue,
} from "@/context/DashboardFiltersContext"

/** Accesses the global tactical filters; requires `DashboardFiltersProvider`. */
export function useDashboardFilters(): DashboardFiltersValue {
  const context = useContext(DashboardFiltersContext)

  if (!context) {
    throw new Error(
      "useDashboardFilters must be used within a DashboardFiltersProvider",
    )
  }

  return context
}
