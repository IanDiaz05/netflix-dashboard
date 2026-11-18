import type { CatalogFilters, ContentType } from "@/types/catalog"

/** Content format filter values, mapped to the `type` dataset column. */
export type ContentFormatFilter = ContentType | "all"

/**
 * Release period presets shown in the header strip.
 * Each preset is resolved into `releaseYearFrom` / `releaseYearTo` bounds.
 */
export type ReleasePeriodFilter = "all" | "last5" | "last10" | "classics"

/** Maturity rating filter values, mapped to the `rating` dataset column. */
export type MaturityRatingFilter = string | "all"

/** Raw global filter selections mirrored into URL search params. */
export interface DashboardFilterParams {
  format: ContentFormatFilter
  period: ReleasePeriodFilter
  rating: MaturityRatingFilter
}

/** Keys of the global tactical filters, used for badge removal and URL params. */
export type DashboardFilterKey = "format" | "period" | "rating"

/** One active filter rendered as a removable badge, with its Spanish label. */
export interface ActiveFilterLabel {
  key: DashboardFilterKey
  label: string
}

/** Loader shape used by dashboard widgets; receives resolved catalog filters. */
export type FiltersFetcher<T> = (filters: CatalogFilters) => Promise<T>
