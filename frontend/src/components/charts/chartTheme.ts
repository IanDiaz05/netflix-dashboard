export const chartColors = {
  crimson: "var(--chart-1)",
  slate: "var(--chart-3)",
  zinc: "var(--chart-2)",
  amber: "var(--chart-amber)",
  emerald: "var(--chart-emerald)",
  grid: "color-mix(in oklch, var(--border) 80%, transparent)",
  axis: "var(--muted-foreground)",
} as const

export const formatContentTypeLabel = (label: string): string => {
  if (label === "Movie") {
    return "Películas"
  }
  if (label === "TV Show") {
    return "Series"
  }
  return label
}

export const formatInteger = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
