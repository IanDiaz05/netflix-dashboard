export type ContentType = "Movie" | "TV Show"

export type DurationUnit = "minutes" | "seasons"

/**
 * Raw catalog row matching the source dataset and the future FastAPI payload.
 * Multi-value columns remain comma-separated strings until mapped to `CatalogItem`.
 */
export interface CatalogItemRecord {
  show_id: string
  type: string
  title: string
  director: string | null
  cast: string | null
  country: string | null
  date_added: string | null
  release_year: number
  rating: string | null
  duration: string
  listed_in: string
  description: string
}

/**
 * Normalized title used by dashboard views.
 * Nullable source fields stay `null` when missing; parsed arrays are empty in that case.
 */
export interface CatalogItem {
  showId: string
  type: ContentType
  title: string
  director: string | null
  directors: string[]
  cast: string | null
  castMembers: string[]
  country: string | null
  countries: string[]
  dateAdded: string | null
  releaseYear: number
  rating: string | null
  duration: string
  durationValue: number | null
  durationUnit: DurationUnit | null
  listedIn: string
  genres: string[]
  description: string
}

export interface DashboardKPIs {
  totalTitles: number
  movieCount: number
  tvShowCount: number
  uniqueCountries: number
  uniqueGenres: number
  averageMovieDurationMinutes: number | null
  leadingCountry: string | null
  leadingGenre: string | null
}

export interface ChartDataPoint {
  label: string
  value: number
  category?: string
}

export interface GenreAndRatingStats {
  genres: ChartDataPoint[]
  ratings: ChartDataPoint[]
}

/**
 * Duration breakdown split by unit, never mixed in one numeric series.
 * `minutes` buckets movies, `seasons` buckets shows.
 */
export interface DurationDistribution {
  minutes: ChartDataPoint[]
  seasons: ChartDataPoint[]
}

export interface CatalogListResponse {
  items: CatalogItem[]
  total: number
  page: number
  pageSize: number
}

export interface CatalogFilters {
  query?: string
  type?: ContentType | "all"
  releaseYearFrom?: number
  releaseYearTo?: number
  country?: string
  genre?: string
  rating?: string
}

export interface CatalogListParams {
  filters?: CatalogFilters
  page?: number
  pageSize?: number
}
