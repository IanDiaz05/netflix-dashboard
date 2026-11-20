# Architecture

Tactical marketing analytics dashboard for a Netflix content catalog.

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4, shadcn/ui (radix-nova), lucide-react |
| Routing | react-router-dom |
| Future API | FastAPI |
| Future database | PostgreSQL |

The frontend lives in `frontend/`. Copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_BASE_URL` (default `http://localhost:8000`).

## Folder structure

```text
frontend/src/
  App.tsx
  main.tsx
  config/
    navigation.ts
    filters.ts
  types/
    catalog.ts
    filters.ts
  services/apiClient.ts
  services/dashboardService.ts
  hooks/usePendingResource.ts
  hooks/useDashboardFilters.ts
  context/DashboardFiltersContext.ts
  context/DashboardFiltersProvider.tsx
  components/layout/     Header, DashboardFilterBar, Sidebar, MainLayout
  components/ui/         shadcn primitives
  components/widgets/    data widgets that own loading and error states
  pages/                 route-level views
  lib/utils.ts
docs/
  ARCHITECTURE.md
  DATA_CONTRACT.md
  UI_GUIDELINES.md
backend/
```

## Routing map

| Path | Page | Purpose |
| --- | --- | --- |
| `/` | `OverviewPage` | KPI cards and format distribution |
| `/trends` | `TrendsPage` | Titles added / released over time |
| `/geography` | `GeographyPage` | Country distribution |
| `/catalog` | `CatalogPage` | Searchable catalog with filter badges and a detail slide-over |
| `*` | redirect to `/` | Unknown routes |

Shell chrome is `MainLayout` (`Sidebar` + `Header` + `Outlet`). Route labels are Spanish; route paths and file names are English. Below `lg`, `Sidebar` is replaced by a slide-over that reuses `SidebarBrand` and `SidebarNav`, opened from `Header`; the filter strip collapses behind a toggle below `md`.

## State and service conventions

- Domain types live in `src/types`. Do not duplicate API shapes inside components.
- HTTP access goes through `apiClient`. Feature modules do not call `fetch` directly.
- `dashboardService` is the only dashboard data controller. Methods match future FastAPI endpoints and currently return unresolved promises so the UI stays on skeletons.
- Data hooks (`usePendingResource`) expose `{ data, error, isLoading, retry }`. Each data widget calls the hook with a filters-aware fetcher and owns its own `isLoading` skeleton and `error` fallback; there is no page-level full-page skeleton. The hook ignores the factory identity and re-runs when `dependencies` change, so widgets stay reactive to filters.
- Error fallbacks are rendered inside the widget card in Spanish ("Error al cargar los datos") with a retry button, so one failed resource never breaks the rest of the layout.

## Global tactical filters

- `DashboardFiltersProvider` (mounted in `App.tsx`) owns the global tactical filters: content format (`type`), release period (year range presets), and maturity rating (`rating`).
- The source of truth is the URL search params (`format`, `period`, `rating`), managed with `useSearchParams`; defaults are omitted from the URL so links stay shareable and validated on read.
- `useDashboardFilters()` exposes raw selections, Spanish labels for active-filter badges, `hasActiveFilters`, setters, and `clearFilters`. It also exposes `catalogFilters`, the filters mapped to the shared `CatalogFilters` contract, ready to pass to `dashboardService` once FastAPI is connected.
- The header renders the strip via `DashboardFilterBar`; option lists and URL parsing live in `config/filters.ts`.

## Future FastAPI mapping (not implemented)

| Controller method | Intended endpoint |
| --- | --- |
| `getKpis` | `GET /api/dashboard/kpis` |
| `getFormatDistribution` | `GET /api/dashboard/formats` |
| `getTemporalTrends` | `GET /api/dashboard/trends` |
| `getGeographicDistribution` | `GET /api/dashboard/geography` |
| `getGenreAndRatingStats` | `GET /api/dashboard/genres-ratings` |
| `getDurationDistribution` | `GET /api/dashboard/durations` |
| `getCatalogItems` | `GET /api/catalog` |

## Commands

```bash
cd frontend
pnpm install
pnpm dev
pnpm typecheck   # tsc --noEmit
pnpm build
```
