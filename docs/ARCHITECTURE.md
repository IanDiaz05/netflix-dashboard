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
  config/navigation.ts
  types/catalog.ts
  services/apiClient.ts
  services/dashboardService.ts
  hooks/usePendingResource.ts
  components/layout/     Header, Sidebar, MainLayout
  components/ui/         shadcn primitives
  components/skeletons/  page loading placeholders
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
| `/catalog` | `CatalogPage` | Searchable catalog plus genre and rating stats |
| `*` | redirect to `/` | Unknown routes |

Shell chrome is `MainLayout` (`Sidebar` + `Header` + `Outlet`). Route labels are Spanish; route paths and file names are English.

## State and service conventions

- Domain types live in `src/types`. Do not duplicate API shapes inside components.
- HTTP access goes through `apiClient`. Feature modules do not call `fetch` directly.
- `dashboardService` is the only dashboard data controller. Methods match future FastAPI endpoints and currently return unresolved promises so the UI stays on skeletons.
- Data hooks (`usePendingResource`) expose `{ data, error, isLoading }`. Pages render skeletons while `isLoading` is true.
- Do not introduce global client state until the backend exists. Filters will be URL search params or local page state in a later phase.

## Future FastAPI mapping (not implemented)

| Controller method | Intended endpoint |
| --- | --- |
| `getKpis` | `GET /api/dashboard/kpis` |
| `getFormatDistribution` | `GET /api/dashboard/formats` |
| `getTemporalTrends` | `GET /api/dashboard/trends` |
| `getGeographicDistribution` | `GET /api/dashboard/geography` |
| `getGenreAndRatingStats` | `GET /api/dashboard/genres-ratings` |
| `getCatalogItems` | `GET /api/catalog` |

## Commands

```bash
cd frontend
pnpm install
pnpm dev
pnpm typecheck   # tsc --noEmit
pnpm build
```
