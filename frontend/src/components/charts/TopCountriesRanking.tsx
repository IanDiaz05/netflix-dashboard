import { ChartEmptyState } from "@/components/charts/ChartEmptyState"
import { chartColors, formatInteger } from "@/components/charts/chartTheme"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { getSpanishCountryName } from "@/lib/countryNames"
import { cn } from "@/lib/utils"
import type { ChartDataPoint } from "@/types/catalog"

interface TopCountriesRankingProps {
  data: ChartDataPoint[]
  limit?: number
}

export function TopCountriesRanking({
  data,
  limit = 10,
}: TopCountriesRankingProps) {
  const { country, setCountry } = useDashboardFilters()
  const ranked = data.slice(0, limit)
  const maxValue = ranked[0]?.value ?? 0

  if (ranked.length === 0) {
    return <ChartEmptyState className="flex h-64 items-center justify-center text-sm text-muted-foreground" />
  }

  return (
    <ol className="flex flex-col gap-3">
      {ranked.map((point) => {
        const isSelected = country === point.label
        const width = maxValue > 0 ? Math.max(6, (point.value / maxValue) * 100) : 0

        return (
          <li key={point.label}>
            <button
              type="button"
              onClick={() =>
                setCountry(isSelected ? "all" : point.label)
              }
              aria-pressed={isSelected}
              className={cn(
                "grid w-full grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 rounded-md px-1 py-0.5 text-left outline-none sm:grid-cols-[7rem_1fr_2.75rem] sm:gap-3",
                "hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                isSelected && "bg-primary/10",
              )}
            >
              <span className="truncate text-xs font-medium">
                {getSpanishCountryName(point.label)}
              </span>
              <span className="h-4 overflow-hidden rounded-sm bg-muted">
                <span
                  className="block h-full rounded-sm"
                  style={{
                    width: `${width}%`,
                    backgroundColor: chartColors.crimson,
                  }}
                />
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {formatInteger(point.value)}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
