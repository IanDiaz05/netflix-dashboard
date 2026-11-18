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

interface GeographyMapCardProps<T> {
  title: string
  description?: string
  fetcher: FiltersFetcher<T>
  className?: string
  /** Resolved-state map renderer; wired in the charting phase. */
  children?: (data: T) => ReactNode
}

const SKELETON_LEGEND_STEPS = 5

/**
 * Primary geographic visualization widget owning its own data lifecycle.
 * Loading mirrors the resolved layout: map canvas plus a legend strip.
 */
export function GeographyMapCard<T>({
  title,
  description,
  fetcher,
  className,
  children,
}: GeographyMapCardProps<T>) {
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
            <Skeleton className="h-80 w-full" />
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-3 w-20" />
              {Array.from({ length: SKELETON_LEGEND_STEPS }).map((_, index) => (
                <Skeleton key={index} className="size-4 rounded-sm" />
              ))}
              <Skeleton className="h-3 w-20" />
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
