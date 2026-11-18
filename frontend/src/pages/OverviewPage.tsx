import { DashboardPageSkeleton } from "@/components/skeletons/DashboardPageSkeleton"
import { usePendingResource } from "@/hooks/usePendingResource"
import { dashboardService } from "@/services/dashboardService"

export function OverviewPage() {
  const kpis = usePendingResource(() => dashboardService.getKpis())
  const formats = usePendingResource(() => dashboardService.getFormatDistribution())

  if (kpis.isLoading || formats.isLoading) {
    return <DashboardPageSkeleton kpiCount={4} chartCount={2} />
  }

  return null
}
