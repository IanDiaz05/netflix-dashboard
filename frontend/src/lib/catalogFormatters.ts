import type { CatalogItem } from "@/types/catalog"

export function formatContentTypeBadge(type: CatalogItem["type"]): string {
  return type === "Movie" ? "Película" : "Serie"
}

export function formatDuration(item: CatalogItem): string {
  if (item.durationUnit === "minutes" && item.durationValue != null) {
    return `${item.durationValue} min`
  }
  if (item.durationUnit === "seasons" && item.durationValue != null) {
    return `${item.durationValue} temp.`
  }
  return item.duration || "No disponible"
}

export function formatDateAdded(isoDate: string | null): string {
  if (!isoDate) {
    return "No disponible"
  }

  const parsed = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) {
    return isoDate
  }

  return parsed.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

