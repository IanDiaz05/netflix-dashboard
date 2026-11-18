import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { CatalogItem } from "@/types/catalog"

interface TitleDetailSheetProps {
  /** Selected catalog item; `null` keeps the sheet closed. */
  item: CatalogItem | null
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

/**
 * Slide-over with the full record of a selected catalog title.
 * Currently a structural placeholder: it opens once a table row is
 * clicked after data resolves, and renders Spanish field labels.
 */
export function TitleDetailSheet({ item, onOpenChange }: TitleDetailSheetProps) {
  const typeLabel = item?.type === "Movie" ? "Película" : "Serie"

  return (
    <Sheet open={item !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="pr-10">
          <SheetTitle>{item?.title ?? ""}</SheetTitle>
          <SheetDescription>
            {item
              ? `${typeLabel} · ${item.releaseYear} · ${item.rating ?? "Sin clasificación"}`
              : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
          <DetailField label="Sinopsis" value={item?.description ?? null} />
          <DetailField
            label="Director"
            value={
              item
                ? (item.director ?? (item.directors.join(", ") || null))
                : null
            }
          />
          <DetailField
            label="Reparto"
            value={
              item ? (item.cast ?? (item.castMembers.join(", ") || null)) : null
            }
          />
          <DetailField
            label="País"
            value={
              item ? (item.country ?? (item.countries.join(", ") || null)) : null
            }
          />
          <DetailField label="Duración" value={item?.duration ?? null} />
          {item && item.genres.length > 0 ? (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Géneros</span>
              <div className="flex flex-wrap gap-1.5">
                {item.genres.map((genre) => (
                  <Badge key={genre} variant="outline">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
