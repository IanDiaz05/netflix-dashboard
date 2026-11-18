import { GeographyMapCard } from "@/components/widgets/GeographyMapCard"
import { RankedBarsCard } from "@/components/widgets/RankedBarsCard"
import { dashboardService } from "@/services/dashboardService"

/** Geography route: country map plus the top producer ranking. */
export function GeographyPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <GeographyMapCard
        className="xl:col-span-3"
        title="Mapa de distribución por país"
        description="Títulos por país de producción"
        fetcher={dashboardService.getGeographicDistribution}
      />
      <RankedBarsCard
        className="xl:col-span-2"
        title="Top 10 países productores"
        description="Ranking de países por número de títulos"
        fetcher={dashboardService.getGeographicDistribution}
      />
    </div>
  )
}
