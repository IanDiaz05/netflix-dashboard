import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DataErrorFallback } from "@/components/widgets/DataErrorFallback"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import { usePendingResource } from "@/hooks/usePendingResource"
import type { FiltersFetcher } from "@/types/filters"

interface KpiCardProps<T> {
  label: string
  fetcher: FiltersFetcher<T>
  /** Formats the resolved metric for display. */
  select: (data: T) => string
}

/**
 * Single KPI widget owning its own data lifecycle.
 * Loading mirrors the resolved layout (header label + big metric value);
 * a failed fetch renders an inline error fallback without leaving the card.
 */
export function KpiCard<T>({ label, fetcher, select }: KpiCardProps<T>) {
  const { catalogFilters } = useDashboardFilters()
  const { data, error, isLoading, retry } = usePendingResource(
    () => fetcher(catalogFilters),
    [catalogFilters],
  )

  return (
    <Card>
      <CardHeader>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : error ? (
          <DataErrorFallback onRetry={retry} />
        ) : (
          <p className="text-2xl font-semibold tracking-tight">
            {select(data as T)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
