import type {
  CatalogFilters,
  CatalogListParams,
  CatalogListResponse,
  ChartDataPoint,
  DashboardKPIs,
  DurationDistribution,
  GenreAndRatingStats,
} from "@/types/catalog"

/**
 * Returns a promise that never settles.
 * Used until FastAPI endpoints are wired so the UI stays in a loading state.
 */
function pending<T>(): Promise<T> {
  return new Promise<T>(() => undefined)
}

export const dashboardService = {
  getKpis(_filters?: CatalogFilters): Promise<DashboardKPIs> {
    return pending<DashboardKPIs>()
  },

  getFormatDistribution(_filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return pending<ChartDataPoint[]>()
  },

  getTemporalTrends(_filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return pending<ChartDataPoint[]>()
  },

  getGeographicDistribution(_filters?: CatalogFilters): Promise<ChartDataPoint[]> {
    return pending<ChartDataPoint[]>()
  },

  getGenreAndRatingStats(_filters?: CatalogFilters): Promise<GenreAndRatingStats> {
    return pending<GenreAndRatingStats>()
  },

  getDurationDistribution(_filters?: CatalogFilters): Promise<DurationDistribution> {
    return pending<DurationDistribution>()
  },

  getCatalogItems(_params?: CatalogListParams): Promise<CatalogListResponse> {
    return pending<CatalogListResponse>()
  },
}
