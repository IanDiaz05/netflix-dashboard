import { createContext } from "react"
import type { CatalogFilters } from "@/types/catalog"
import type {
  ActiveFilterLabel,
  ContentFormatFilter,
  MaturityRatingFilter,
  ReleasePeriodFilter,
} from "@/types/filters"

export interface DashboardFiltersValue {
  format: ContentFormatFilter
  period: ReleasePeriodFilter
  rating: MaturityRatingFilter
  /** Filters resolved against the `CatalogFilters` contract for service calls. */
  catalogFilters: CatalogFilters
  /** Removable badges for the active filters, with Spanish labels. */
  activeFilterLabels: ActiveFilterLabel[]
  hasActiveFilters: boolean
  setFormat: (value: ContentFormatFilter) => void
  setPeriod: (value: ReleasePeriodFilter) => void
  setRating: (value: MaturityRatingFilter) => void
  clearFilters: () => void
}

export const DashboardFiltersContext =
  createContext<DashboardFiltersValue | null>(null)
