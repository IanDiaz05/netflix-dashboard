import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DataErrorFallback } from "@/components/widgets/DataErrorFallback"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { usePendingResource } from "@/hooks/usePendingResource"
import type { DurationDistribution } from "@/types/catalog"
import type { FiltersFetcher } from "@/types/filters"

interface DurationSplitCardProps {
  title: string
  description?: string
  fetcher: FiltersFetcher<DurationDistribution>
  className?: string
  /** Resolved-state renderer; wired in the charting phase. */
  children?: (data: DurationDistribution) => ReactNode
}

interface DurationPanel {
  key: "minutes" | "seasons"
  label: string
}

const DURATION_PANELS: DurationPanel[] = [
  { key: "minutes", label: "Duración de películas (minutos)" },
  { key: "seasons", label: "Temporadas por serie" },
]

/** Deterministic bar heights so the skeleton layout stays stable. */
const SKELETON_BAR_HEIGHTS = [55, 74, 40, 88, 66, 48]

/**
 * Duration breakdown widget owning its own data lifecycle.
 * Minutes and seasons are never mixed into one numeric series, so the
 * loading skeleton mirrors two side-by-side panels.
 */
export function DurationSplitCard({
  title,
  description,
  fetcher,
  className,
  children,
}: DurationSplitCardProps) {
  const { catalogFilters } = useDashboardFilters()
  const { data, error, isLoading, retry } = usePendingResource(
    () => fetcher(catalogFilters),
    [catalogFilters],
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {DURATION_PANELS.map((panel) => (
              <div
                key={panel.key}
                className="flex flex-col gap-3 rounded-lg border border-border p-4"
              >
                <span className="text-xs text-muted-foreground">
                  {panel.label}
                </span>
                <div className="flex h-36 items-end gap-2">
                  {SKELETON_BAR_HEIGHTS.map((height, index) => (
                    <Skeleton
                      key={index}
                      className="min-w-0 flex-1"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <DataErrorFallback onRetry={retry} />
        ) : (
          children?.(data as DurationDistribution)
        )}
      </CardContent>
    </Card>
  )
}
