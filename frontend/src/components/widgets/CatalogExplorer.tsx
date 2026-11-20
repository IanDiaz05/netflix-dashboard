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
import { DataErrorFallback } from "@/components/widgets/DataErrorFallback"
import { TitleDetailSheet } from "@/components/widgets/TitleDetailSheet"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { usePendingResource } from "@/hooks/usePendingResource"
import {
  formatContentTypeBadge,
  formatDuration,
} from "@/lib/catalogFormatters"
import { dashboardService } from "@/services/dashboardService"
import type { CatalogFilters, CatalogItem } from "@/types/catalog"

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
const SEARCH_DEBOUNCE_MS = 300
const GENRE_BADGE_LIMIT = 2

interface CatalogResultsProps {
  catalogFilters: CatalogFilters
  searchQuery: string
}

function GenreBadges({ genres }: { genres: string[] }) {
  if (genres.length === 0) {
    return <span className="text-xs text-muted-foreground">Sin géneros</span>
  }

  const visible = genres.slice(0, GENRE_BADGE_LIMIT)
  const extra = genres.length - visible.length

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((genre) => (
        <Badge key={genre} variant="outline">
          {genre}
        </Badge>
      ))}
      {extra > 0 ? (
        <Badge variant="secondary">+{extra}</Badge>
      ) : null}
    </div>
  )
}

function CatalogResults({ catalogFilters, searchQuery }: CatalogResultsProps) {
  const [page, setPage] = useState(1)
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)

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
  const shownCount = data?.items.length ?? 0

  const openItem = (item: CatalogItem) => {
    setSelectedShowId(item.showId)
  }

  return (
    <>
      {error ? (
        <div className="flex justify-center py-8">
          <div className="w-full max-w-sm">
            <DataErrorFallback onRetry={retry} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {isLoading
              ? Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-10" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))
              : data?.items.map((item) => (
                  <button
                    key={item.showId}
                    type="button"
                    onClick={() => openItem(item)}
                    className="flex w-full flex-col gap-2 rounded-lg border border-border p-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 flex-1 text-sm font-medium break-words">
                        {item.title}
                      </span>
                      <Badge variant="outline">
                        {formatContentTypeBadge(item.type)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>{item.releaseYear}</span>
                      <span>{item.rating ?? "NR"}</span>
                      <span>{formatDuration(item)}</span>
                    </div>
                    <GenreBadges genres={item.genres} />
                  </button>
                ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full min-w-[40rem] text-sm">
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
                  ? Array.from({ length: SKELETON_ROW_COUNT }).map(
                      (_, index) => (
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
                      ),
                    )
                  : data?.items.map((item) => (
                      <tr
                        key={item.showId}
                        onClick={() => openItem(item)}
                        className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="px-3 py-3 font-medium">
                          <button
                            type="button"
                            className="text-left font-medium"
                            onClick={(event) => {
                              event.stopPropagation()
                              openItem(item)
                            }}
                          >
                            {item.title}
                          </button>
                        </td>
                        <td className="px-3 py-3">
                          <Badge variant="outline">
                            {formatContentTypeBadge(item.type)}
                          </Badge>
                        </td>
                        <td className="px-3 py-3">{item.releaseYear}</td>
                        <td className="px-3 py-3">{item.rating ?? "NR"}</td>
                        <td className="px-3 py-3">{formatDuration(item)}</td>
                        <td className="px-3 py-3">
                          <GenreBadges genres={item.genres} />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {isLoading || error ? (
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">
              Página {data?.page} de {totalPages}
            </p>
            <p className="text-xs text-muted-foreground">
              Mostrando {shownCount} de {data?.total ?? 0} títulos
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeftIcon aria-hidden="true" />
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
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
        showId={selectedShowId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedShowId(null)
          }
        }}
      />
    </>
  )
}

export function CatalogExplorer() {
  const {
    catalogFilters,
    activeFilterLabels,
    setFormat,
    setPeriod,
    setRating,
    setCountry,
  } = useDashboardFilters()
  const [searchValue, setSearchValue] = useState("")
  const debouncedQuery = useDebouncedValue(searchValue, SEARCH_DEBOUNCE_MS)

  const clearBadge = (key: string) => {
    if (key === "format") {
      setFormat("all")
    } else if (key === "period") {
      setPeriod("all")
    } else if (key === "rating") {
      setRating("all")
    } else if (key === "country") {
      setCountry("all")
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
          key={`${JSON.stringify(catalogFilters)}|${debouncedQuery}`}
          catalogFilters={catalogFilters}
          searchQuery={debouncedQuery}
        />
      </CardContent>
    </Card>
  )
}
