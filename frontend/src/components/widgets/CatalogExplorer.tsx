import { useState } from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { usePendingResource } from "@/hooks/usePendingResource"
import { dashboardService } from "@/services/dashboardService"
import { DataErrorFallback } from "@/components/widgets/DataErrorFallback"
import { TitleDetailSheet } from "@/components/widgets/TitleDetailSheet"
import type { CatalogFilters, CatalogItem } from "@/types/catalog"

/** Column headers mirror the resolved table layout. */
const CATALOG_COLUMNS = [
  "Título",
  "Tipo",
  "Año",
  "Clasificación",
  "Duración",
  "Géneros",
] as const

const SKELETON_ROW_COUNT = 8
const PAGE_SIZE = 20

interface CatalogResultsProps {
  catalogFilters: CatalogFilters
  searchQuery: string
}

/**
 * Table, pagination, and detail slide-over for the current query.
 * Remounted by `CatalogExplorer` whenever the filters or search change,
 * which resets page and selection to their initial state.
 */
function CatalogResults({ catalogFilters, searchQuery }: CatalogResultsProps) {
  const [page, setPage] = useState(1)
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)


  const { data, error, isLoading, retry } = usePendingResource(
    () =>
      dashboardService.getCatalogItems({
        filters: {
          ...catalogFilters,
          query: searchQuery.trim() || undefined,
        },
        page,
        pageSize: PAGE_SIZE,
      }),
    [catalogFilters, searchQuery, page],
  )

  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / data.pageSize))
    : 1

  return (
    <>
      {error ? (
        <div className="flex justify-center py-8">
          <div className="w-full max-w-sm">
            <DataErrorFallback onRetry={retry} />
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {CATALOG_COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1.5">
                          <Skeleton className="h-3.5 w-44" />
                          <Skeleton className="h-2.5 w-24" />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-3 w-10" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-3 w-16" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1.5">
                          <Skeleton className="h-2.5 w-16" />
                          <Skeleton className="h-2.5 w-20" />
                        </div>
                      </td>
                    </tr>
                  ))
                : data?.items.map((item) => (
                    <tr
                      key={item.showId}
                      onClick={() => setSelectedItem(item)}
                      className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <td className="px-3 py-3 font-medium">{item.title}</td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">
                          {item.type === "Movie" ? "Película" : "Serie"}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">{item.releaseYear}</td>
                      <td className="px-3 py-3">{item.rating ?? "NR"}</td>
                      <td className="px-3 py-3">{item.duration}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {item.genres.slice(0, 2).join(", ")}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        {isLoading || error ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <p className="text-xs text-muted-foreground">
            Página {data?.page} de {totalPages}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeftIcon aria-hidden="true" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={data ? page >= totalPages : true}
            onClick={() =>
              setPage((current) => Math.min(totalPages, current + 1))
            }
          >
            Siguiente
            <ChevronRightIcon aria-hidden="true" />
          </Button>
        </div>
      </div>

      <TitleDetailSheet
        item={selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
          }
        }}
      />
    </>
  )
}

/**
 * Operational catalog explorer owning its own data lifecycle.
 * The search input and active filter badges are interactive from Phase 2;
 * the table body, pagination info, and detail slide-over stay in their
 * skeleton / closed state until FastAPI is connected.
 */
export function CatalogExplorer() {
  const {
    catalogFilters,
    activeFilterLabels,
    setFormat,
    setPeriod,
    setRating,
  } = useDashboardFilters()
  const [searchValue, setSearchValue] = useState("")

  const clearBadge = (key: string) => {
    if (key === "format") {
      setFormat("all")
    } else if (key === "period") {
      setPeriod("all")
    } else if (key === "rating") {
      setRating("all")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explorador de títulos</CardTitle>
        <CardDescription>
          Busca y filtra el catálogo completo por formato, año o clasificación.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar por título, director o reparto..."
              className="pl-8"
              aria-label="Buscar en el catálogo"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              Filtros activos:
            </span>
            {activeFilterLabels.length === 0 ? (
              <span className="text-xs text-muted-foreground">Ninguno</span>
            ) : (
              activeFilterLabels.map((active) => (
                <Badge key={active.key} variant="outline" className="gap-1 pr-1">
                  {active.label}
                  <button
                    type="button"
                    onClick={() => clearBadge(active.key)}
                    className="rounded-full p-0.5 transition-colors hover:bg-muted"
                    aria-label={`Quitar filtro ${active.label}`}
                  >
                    <XIcon className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </div>

        <CatalogResults
          key={`${JSON.stringify(catalogFilters)}|${searchValue}`}
          catalogFilters={catalogFilters}
          searchQuery={searchValue}
        />
      </CardContent>
    </Card>
  )
}
