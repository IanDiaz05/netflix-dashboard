import { DashboardPageSkeleton } from "@/components/skeletons/DashboardPageSkeleton"
import { usePendingResource } from "@/hooks/usePendingResource"
import { dashboardService } from "@/services/dashboardService"

export function GeographyPage() {
  const geography = usePendingResource(() =>
    dashboardService.getGeographicDistribution(),
  )

  if (geography.isLoading) {
    return <DashboardPageSkeleton kpiCount={0} chartCount={2} />
  }

  return null
}
