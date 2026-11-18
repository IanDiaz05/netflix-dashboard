import { DashboardPageSkeleton } from "@/components/skeletons/DashboardPageSkeleton"
import { usePendingResource } from "@/hooks/usePendingResource"
import { dashboardService } from "@/services/dashboardService"

export function CatalogPage() {
  const catalog = usePendingResource(() => dashboardService.getCatalogItems())
  const stats = usePendingResource(() => dashboardService.getGenreAndRatingStats())

  if (catalog.isLoading || stats.isLoading) {
    return <DashboardPageSkeleton kpiCount={2} chartCount={2} />
  }

  return null
}
