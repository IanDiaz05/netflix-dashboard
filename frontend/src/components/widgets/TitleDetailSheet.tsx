import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { DataErrorFallback } from "@/components/widgets/DataErrorFallback"
import { usePendingResource } from "@/hooks/usePendingResource"
import {
  formatContentTypeBadge,
  formatDateAdded,
  formatDuration,
} from "@/lib/catalogFormatters"
import { dashboardService } from "@/services/dashboardService"
import type { CatalogItem } from "@/types/catalog"

interface TitleDetailSheetProps {
  showId: string | null
  onOpenChange: (open: boolean) => void
}

interface DetailFieldProps {
  label: string
  value: string | null
}

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm">{value ?? "No disponible"}</p>
    </div>
  )
}

function TitleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  )
}

function TitleDetailBody({ item }: { item: CatalogItem }) {
  const productionCountry =
    item.country ?? (item.countries.join(", ") || null)
  const director = item.director ?? (item.directors.join(", ") || null)
  const cast = item.cast ?? (item.castMembers.join(", ") || null)

  return (
    <div className="flex flex-col gap-4 p-4">
      <DetailField label="Título" value={item.title} />
      <DetailField label="Sinopsis" value={item.description} />
      <DetailField label="Director" value={director} />
      <DetailField label="Reparto" value={cast} />
      <DetailField label="País de producción" value={productionCountry} />
      <DetailField
        label="Fecha de incorporación"
        value={formatDateAdded(item.dateAdded)}
      />
      <DetailField label="Año de estreno" value={String(item.releaseYear)} />
      <DetailField
        label="Clasificación"
        value={item.rating ?? "Sin clasificación"}
      />
      <DetailField label="Duración" value={formatDuration(item)} />
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Géneros</span>
        {item.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {item.genres.map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm">No disponible</p>
        )}
      </div>
    </div>
  )
}

function TitleDetailContent({ showId }: { showId: string }) {
  const { data, error, isLoading, retry } = usePendingResource(
    () => dashboardService.getCatalogItem(showId),
    [showId],
  )
  const typeLabel = data ? formatContentTypeBadge(data.type) : "Título"

  return (
    <>
      <SheetHeader className="pr-10">
        <SheetTitle>
          {isLoading ? "Cargando título" : (data?.title ?? "Detalle del título")}
        </SheetTitle>
        <SheetDescription>
          {data
            ? `${typeLabel} · ${data.releaseYear} · ${data.rating ?? "Sin clasificación"}`
            : "Ficha completa del título seleccionado"}
        </SheetDescription>
      </SheetHeader>
      {isLoading ? (
        <TitleDetailSkeleton />
      ) : error ? (
        <div className="p-4">
          <DataErrorFallback onRetry={retry} />
        </div>
      ) : data ? (
        <TitleDetailBody item={data} />
      ) : null}
    </>
  )
}

/**
 * Slide-over with the full record of a selected catalog title.
 * Fetches `GET /catalog/{show_id}` while open and owns its loading state.
 */
export function TitleDetailSheet({ showId, onOpenChange }: TitleDetailSheetProps) {
  return (
    <Sheet open={showId !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {showId ? <TitleDetailContent showId={showId} /> : null}
      </SheetContent>
    </Sheet>
  )
}
