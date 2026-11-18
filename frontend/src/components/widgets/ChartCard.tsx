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
import type { FiltersFetcher } from "@/types/filters"

interface ChartCardProps<T> {
  title: string
  description?: string
  fetcher: FiltersFetcher<T>
  className?: string
  /** Resolved-state chart renderer; wired in the charting phase. */
  children?: (data: T) => ReactNode
}

/** Deterministic bar heights so the skeleton layout stays stable. */
const SKELETON_BAR_HEIGHTS = [42, 68, 55, 80, 62, 38, 74, 48]
const SKELETON_AXIS_TICKS = 6

/**
 * Chart container widget owning its own data lifecycle.
 * Loading renders a structurally accurate axis + plot skeleton that
 * mirrors the resolved chart layout.
 */
export function ChartCard<T>({
  title,
  description,
  fetcher,
  className,
  children,
}: ChartCardProps<T>) {
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
          <div className="flex h-56 flex-col gap-3 sm:h-64">
            <div className="flex min-h-0 flex-1 gap-3">
              <Skeleton className="h-full w-px shrink-0" />
              <div className="flex min-h-0 flex-1 items-end gap-2">
                {SKELETON_BAR_HEIGHTS.map((height, index) => (
                  <Skeleton
                    key={index}
                    className="min-w-0 flex-1"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: SKELETON_AXIS_TICKS }).map((_, index) => (
                <Skeleton key={index} className="h-3 flex-1" />
              ))}
            </div>
          </div>
        ) : error ? (
          <DataErrorFallback onRetry={retry} />
        ) : (
          children?.(data as T)
        )}
      </CardContent>
    </Card>
  )
}
