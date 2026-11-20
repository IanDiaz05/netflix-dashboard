import { apiClient } from "@/services/apiClient"
import type {
  CatalogFilters,
  CatalogItem,
  CatalogListParams,
  CatalogListResponse,
  ChartDataPoint,
  DashboardKPIs,
  DurationDistribution,
  GenreAndRatingStats,
} from "@/types/catalog"

type QueryValue = string | number | undefined | null

function isPresent(value: QueryValue): value is string | number {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === "string") {
    return value.trim().length > 0 && value !== "all"
  }
  return true
}

function toQueryString(
  filters?: CatalogFilters,
  extra?: Record<string, QueryValue>,
): string {
  const params = new URLSearchParams()
  const entries: Record<string, QueryValue> = {
    query: filters?.query,
    type: filters?.type,
    rating: filters?.rating,
    country: filters?.country,
    genre: filters?.genre,
    releaseYearFrom: filters?.releaseYearFrom,
    releaseYearTo: filters?.releaseYearTo,
    ...extra,
  }

  for (const [key, value] of Object.entries(entries)) {
    if (!isPresent(value)) {
      continue
    }
    params.set(key, String(value))
  }

  const serialized = params.toString()
  return serialized ? `?${serialized}` : ""
}

export const dashboardService = {
  getKpis(filters?: CatalogFilters): Promise<DashboardKPIs> {
    return apiClient<DashboardKPIs>(`/dashboard/kpis${toQueryString(filters)}`)
  },

  getFormatDistribution(filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return apiClient<ChartDataPoint[]>(
      `/dashboard/formats${toQueryString(filters)}`,
    )
  },

  getTemporalTrends(filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return apiClient<ChartDataPoint[]>(
      `/dashboard/trends${toQueryString(filters)}`,
    )
  },

  getGeographicDistribution(filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return apiClient<ChartDataPoint[]>(
      `/dashboard/geography${toQueryString(filters)}`,
    )
  },

  getGenreAndRatingStats(filters?: CatalogFilters): Promise<GenreAndRatingStats> {
    return apiClient<GenreAndRatingStats>(
      `/dashboard/genres-ratings${toQueryString(filters)}`,
    )
  },

  getDurationDistribution(filters?: CatalogFilters): Promise<DurationDistribution> {
    return apiClient<DurationDistribution>(
      `/dashboard/durations${toQueryString(filters)}`,
    )
  },

  getCatalogItems(params?: CatalogListParams): Promise<CatalogListResponse> {
    return apiClient<CatalogListResponse>(
      `/catalog${toQueryString(params?.filters, {
        page: params?.page,
        pageSize: params?.pageSize,
      })}`,
    )
  },

  getCatalogItem(showId: string): Promise<CatalogItem> {
    return apiClient<CatalogItem>(`/catalog/${encodeURIComponent(showId)}`)
  },
}
