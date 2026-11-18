import { ChartCard } from "@/components/widgets/ChartCard"
import { KpiCard } from "@/components/widgets/KpiCard"
import { dashboardService } from "@/services/dashboardService"
import type { DashboardKPIs } from "@/types/catalog"

function formatTotalTitles(kpis: DashboardKPIs): string {
  return kpis.totalTitles.toLocaleString("es-ES")
}

function formatFormatRatio(kpis: DashboardKPIs): string {
  return `${kpis.movieCount.toLocaleString("es-ES")} / ${kpis.tvShowCount.toLocaleString("es-ES")}`
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
    <div className="flex flex-col gap-6">
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
          label="Proporción Películas/Series"
          fetcher={dashboardService.getKpis}
          select={formatFormatRatio}
        />
        <KpiCard
          label="País líder"
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
        />
        <ChartCard
          title="Top clasificaciones por edad"
          description="Títulos por clasificación de edad"
          fetcher={(filters) =>
            dashboardService
              .getGenreAndRatingStats(filters)
              .then((stats) => stats.ratings)
          }
        />
      </section>
    </div>
  )
}
