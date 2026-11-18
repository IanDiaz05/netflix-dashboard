# Data contract

Source: Netflix movies and TV shows catalog (tabular export). The FastAPI layer will persist these columns in PostgreSQL and expose the TypeScript contracts in `frontend/src/types/catalog.ts`.

## Dataset columns

| Column | Expected type | Nulls | Notes |
| --- | --- | --- | --- |
| `show_id` | string | no | Stable identifier (`s1`, `s2`, ...). Maps to `CatalogItem.showId`. |
| `type` | string | no | Dataset values: `Movie`, `TV Show`. Maps to `ContentType`. |
| `title` | string | no | Display title. |
| `director` | string or null | yes | Comma-separated when multiple. Parse into `directors: string[]`. |
| `cast` | string or null | yes | Comma-separated names. Parse into `castMembers: string[]`. |
| `country` | string or null | yes | Comma-separated countries, including co-productions. Parse into `countries: string[]`. |
| `date_added` | string or null | yes | Typically `Month D, YYYY` (example: `September 25, 2021`). Normalize to ISO `YYYY-MM-DD` as `dateAdded`. |
| `release_year` | integer | no | Original release year, not the Netflix add year. |
| `rating` | string or null | yes | Age rating (`TV-MA`, `PG-13`, `R`, ...). A few rows may store duration in this column; treat those as dirty and map to `null` or repair in ETL. |
| `duration` | string | mixed | Movies: `N min`. Shows: `N Season` / `N Seasons`. Split into `durationValue` + `durationUnit` (`minutes` \| `seasons`). |
| `listed_in` | string | no | Comma-separated genres/tags. Parse into `genres: string[]`. |
| `description` | string | no | Short synopsis. |

## Known quirks

1. **Comma-separated strings:** `listed_in`, `country`, `cast`, and `director` are not arrays in the file. Split on `,`, trim whitespace, drop empty tokens.
2. **Mixed duration units:** never chart raw `duration` as a number. Convert minutes and seasons separately.
3. **Nullable production fields:** `director`, `cast`, `country`, `date_added`, and `rating` are frequently empty. Use `null` in TypeScript; do not coerce to `""` in KPI math.
4. **Country explosion:** one title can count toward several countries. Geographic charts should use exploded country rows, not raw strings.
5. **Genre explosion:** same pattern for `listed_in`.
6. **`date_added` vs `release_year`:** marketing “when it landed on the platform” is `date_added`; production vintage is `release_year`.
7. **Inconsistent rating values:** besides TV/MPAA labels, expect `NR`, `UR`, `NC-17`, and occasional swapped duration values.

## TypeScript interfaces

Defined in `frontend/src/types/catalog.ts`:

- `CatalogItemRecord` — snake_case payload matching the twelve source columns.
- `CatalogItem` — camelCase dashboard model with parsed arrays and duration parts.
- `DashboardKPIs` — headline metrics for the overview, including the leading country and genre.
- `ChartDataPoint` — `{ label, value, category? }` for all chart series.
- `DurationDistribution` — duration breakdown split by unit (`minutes` for movies, `seasons` for shows).
- `CatalogFilters` — shared query filters (`query`, `type`, year range, `country`, `genre`, `rating`).
- `GenreAndRatingStats` / `CatalogListResponse` — aggregated and paginated API envelopes.

Until FastAPI is connected, `dashboardService` methods return unresolved promises of these types.
