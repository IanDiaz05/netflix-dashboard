import { DashboardPageSkeleton } from "@/components/skeletons/DashboardPageSkeleton"
import { usePendingResource } from "@/hooks/usePendingResource"
import { dashboardService } from "@/services/dashboardService"

export function TrendsPage() {
  const trends = usePendingResource(() => dashboardService.getTemporalTrends())

  if (trends.isLoading) {
    return <DashboardPageSkeleton kpiCount={0} chartCount={2} />
  }

  return null
}
