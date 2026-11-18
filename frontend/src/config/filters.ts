import type {
  CatalogFilters,
} from "@/types/catalog"
import type {
  ActiveFilterLabel,
  ContentFormatFilter,
  DashboardFilterKey,
  DashboardFilterParams,
  MaturityRatingFilter,
  ReleasePeriodFilter,
} from "@/types/filters"

export interface FilterOption<T extends string> {
  value: T
  label: string
}

/** URL search param names for the global tactical filters. */
export const FILTER_PARAM_KEYS: Record<DashboardFilterKey, string> = {
  format: "format",
  period: "period",
  rating: "rating",
}

export const defaultFilterParams: DashboardFilterParams = {
  format: "all",
  period: "all",
  rating: "all",
}

export const contentFormatOptions: FilterOption<ContentFormatFilter>[] = [
  { value: "all", label: "Todos" },
  { value: "Movie", label: "Películas" },
  { value: "TV Show", label: "Series" },
]

export const releasePeriodOptions: FilterOption<ReleasePeriodFilter>[] = [
  { value: "all", label: "Todos los años" },
  { value: "last5", label: "Últimos 5 años" },
  { value: "last10", label: "Últimos 10 años" },
  { value: "classics", label: "Clásicos" },
]

export const maturityRatingOptions: FilterOption<MaturityRatingFilter>[] = [
  { value: "all", label: "Todas las clasificaciones" },
  { value: "TV-MA", label: "TV-MA" },
  { value: "TV-14", label: "TV-14" },
  { value: "PG-13", label: "PG-13" },
  { value: "R", label: "R" },
  { value: "TV-PG", label: "TV-PG" },
]

/** Titles released before this year count as classics. */
const CLASSICS_UPPER_BOUND = 2000

/** Window size, in years, of the recent-release presets. */
const LAST5_WINDOW = 5
const LAST10_WINDOW = 10

function matchOption<T extends string>(
  raw: string | null,
  options: FilterOption<T>[],
): T | null {
  return options.some((option) => option.value === raw) ? (raw as T) : null
}

/** Reads and validates global filters from URL search params, falling back to defaults. */
export function parseFilterParams(
  searchParams: URLSearchParams,
): DashboardFilterParams {
  return {
    format:
      matchOption(
        searchParams.get(FILTER_PARAM_KEYS.format),
        contentFormatOptions,
      ) ?? defaultFilterParams.format,
    period:
      matchOption(
        searchParams.get(FILTER_PARAM_KEYS.period),
        releasePeriodOptions,
      ) ?? defaultFilterParams.period,
    rating:
      matchOption(
        searchParams.get(FILTER_PARAM_KEYS.rating),
        maturityRatingOptions,
      ) ?? defaultFilterParams.rating,
  }
}

export function isDefaultFilters(params: DashboardFilterParams): boolean {
  return (
    params.format === defaultFilterParams.format &&
    params.period === defaultFilterParams.period &&
    params.rating === defaultFilterParams.rating
  )
}

/**
 * Maps the raw filter selections to the shared `CatalogFilters` contract
 * consumed by `dashboardService` when the FastAPI backend is connected.
 */
export function toCatalogFilters(
  params: DashboardFilterParams,
): CatalogFilters {
  const filters: CatalogFilters = {}

  if (params.format !== "all") {
    filters.type = params.format
  }
  if (params.rating !== "all") {
    filters.rating = params.rating
  }

  const currentYear = new Date().getFullYear()

  if (params.period === "last5") {
    filters.releaseYearFrom = currentYear - LAST5_WINDOW
  } else if (params.period === "last10") {
    filters.releaseYearFrom = currentYear - LAST10_WINDOW
  } else if (params.period === "classics") {
    filters.releaseYearTo = CLASSICS_UPPER_BOUND - 1
  }

  return filters
}

/** Spanish labels of the non-default filters, for removable badges. */
export function getActiveFilterLabels(
  params: DashboardFilterParams,
): ActiveFilterLabel[] {
  const labels: ActiveFilterLabel[] = []

  if (params.format !== "all") {
    const option = contentFormatOptions.find(
      (candidate) => candidate.value === params.format,
    )
    if (option) {
      labels.push({ key: "format", label: option.label })
    }
  }
  if (params.period !== "all") {
    const option = releasePeriodOptions.find(
      (candidate) => candidate.value === params.period,
    )
    if (option) {
      labels.push({ key: "period", label: option.label })
    }
  }
  if (params.rating !== "all") {
    const option = maturityRatingOptions.find(
      (candidate) => candidate.value === params.rating,
    )
    if (option) {
      labels.push({ key: "rating", label: option.label })
    }
  }

  return labels
}
