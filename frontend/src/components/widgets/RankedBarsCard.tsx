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

interface RankedBarsCardProps<T> {
  title: string
  description?: string
  fetcher: FiltersFetcher<T>
  /** Number of ranked skeleton rows shown while loading. */
  barCount?: number
  className?: string
  /** Resolved-state bar renderer; wired in the charting phase. */
  children?: (data: T) => ReactNode
}

/**
 * Ranked horizontal bar widget owning its own data lifecycle.
 * Loading renders label / bar / value rows that mirror the resolved layout.
 */
export function RankedBarsCard<T>({
  title,
  description,
  fetcher,
  barCount = 10,
  className,
  children,
}: RankedBarsCardProps<T>) {
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
          <div className="flex flex-col gap-3">
            {Array.from({ length: barCount }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2 sm:grid-cols-[7rem_1fr_2.5rem] sm:gap-3"
              >
                <Skeleton className="h-3 w-full" />
                <Skeleton
                  className="h-4 rounded-sm"
                  style={{
                    width: `${Math.max(24, 100 - index * 8)}%`,
                  }}
                />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
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
