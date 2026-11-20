import { formatInteger } from "@/components/charts/chartTheme"
import { FormatDonutChart } from "@/components/charts/FormatDonutChart"
import { RatingBarChart } from "@/components/charts/RatingBarChart"
import { ChartCard } from "@/components/widgets/ChartCard"
import { KpiCard } from "@/components/widgets/KpiCard"
import { dashboardService } from "@/services/dashboardService"
import type { DashboardKPIs } from "@/types/catalog"

function formatTotalTitles(kpis: DashboardKPIs): string {
  return formatInteger(kpis.totalTitles)
}

function formatFormatRatio(kpis: DashboardKPIs): string {
  const total = kpis.movieCount + kpis.tvShowCount
  if (total === 0) {
    return "No disponible"
  }
  const movieShare = Math.round((kpis.movieCount / total) * 100)
  const seriesShare = 100 - movieShare
  return `${movieShare} % películas · ${seriesShare} % series`
}

function formatLeadingCountry(kpis: DashboardKPIs): string {
  return kpis.leadingCountry ?? "No disponible"
}

function formatLeadingGenre(kpis: DashboardKPIs): string {
  return kpis.leadingGenre ?? "No disponible"
}

/** Overview route: KPI row plus format and rating distribution charts. */
export function OverviewPage() {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <section
        aria-label="Indicadores clave"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Total de títulos"
          fetcher={dashboardService.getKpis}
          select={formatTotalTitles}
        />
        <KpiCard
          label="Proporción Películas vs. Series"
          fetcher={dashboardService.getKpis}
          select={formatFormatRatio}
        />
        <KpiCard
          label="País líder de producción"
          fetcher={dashboardService.getKpis}
          select={formatLeadingCountry}
        />
        <KpiCard
          label="Género principal"
          fetcher={dashboardService.getKpis}
          select={formatLeadingGenre}
        />
      </section>
      <section
        aria-label="Distribuciones del catálogo"
        className="grid gap-4 lg:grid-cols-2"
      >
        <ChartCard
          title="Distribución por formato"
          description="Películas frente a series en el catálogo"
          fetcher={dashboardService.getFormatDistribution}
        >
          {(data) => <FormatDonutChart data={data} />}
        </ChartCard>
        <ChartCard
          title="Top clasificaciones por edad"
          description="Títulos por clasificación de edad"
          fetcher={(filters) =>
            dashboardService
              .getGenreAndRatingStats(filters)
              .then((stats) => stats.ratings)
          }
        >
          {(data) => <RatingBarChart data={data} />}
        </ChartCard>
      </section>
    </div>
  )
}
