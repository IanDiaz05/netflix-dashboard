import { DurationBarCharts } from "@/components/charts/DurationBarCharts"
import { TrendsAreaChart } from "@/components/charts/TrendsAreaChart"
import { ChartCard } from "@/components/widgets/ChartCard"
import { DurationSplitCard } from "@/components/widgets/DurationSplitCard"
import { dashboardService } from "@/services/dashboardService"

/** Trends route: temporal evolution plus the duration breakdown. */
export function TrendsPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <section
        aria-label="Tendencias temporales"
        className="grid gap-4 xl:grid-cols-3"
      >
        <ChartCard
          className="xl:col-span-2"
          title="Evolución temporal"
          description="Comparación entre año de estreno e incorporación al catálogo"
          fetcher={dashboardService.getTemporalTrends}
        >
          {(data) => <TrendsAreaChart data={data} series="both" />}
        </ChartCard>
        <ChartCard
          title="Ritmo de incorporación al catálogo"
          description="Títulos por año de incorporación"
          fetcher={dashboardService.getTemporalTrends}
        >
          {(data) => <TrendsAreaChart data={data} series="dateAdded" />}
        </ChartCard>
      </section>
      <DurationSplitCard
        title="Distribución de duración"
        description="Minutos para películas, temporadas para series"
        fetcher={dashboardService.getDurationDistribution}
      >
        {(data) => <DurationBarCharts data={data} />}
      </DurationSplitCard>
    </div>
  )
}
