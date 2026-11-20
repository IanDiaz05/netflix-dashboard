import { useMemo, useState, type PointerEvent } from "react"
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo"
import { feature } from "topojson-client"
import worldAtlas from "world-atlas/countries-110m.json"
import { ChartEmptyState } from "@/components/charts/ChartEmptyState"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import {
  catalogNameForAtlas,
  formatCountryTooltip,
  resolveAtlasName,
} from "@/lib/countryNames"
import type { ChartDataPoint } from "@/types/catalog"

interface WorldChoroplethProps {
  data: ChartDataPoint[]
}

interface AtlasCountryFeature {
  id?: string | number
  properties: { name: string }
}

interface CountryStats {
  titleCount: number
  catalogName: string
}

interface MapTooltipState {
  text: string
  x: number
  y: number
}

const MAP_WIDTH = 960
const MAP_HEIGHT = 460
const ZERO_FILL = "#1e293b"
const PEAK_FILL = { r: 229, g: 9, b: 20 }
const BASE_FILL = { r: 30, g: 41, b: 59 }

const countriesGeo = feature(
  worldAtlas as never,
  worldAtlas.objects.countries as never,
)
const countriesCollection = countriesGeo as unknown as {
  type: "FeatureCollection"
  features: AtlasCountryFeature[]
}

const projection = geoNaturalEarth1().fitExtent(
  [
    [12, 8],
    [MAP_WIDTH - 12, MAP_HEIGHT - 8],
  ],
  countriesGeo as GeoPermissibleObjects,
)

const pathGenerator = geoPath(projection)

function mixColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t))
  const mix = (from: number, to: number) =>
    Math.round(from + (to - from) * clamped)
  return `rgb(${mix(BASE_FILL.r, PEAK_FILL.r)} ${mix(BASE_FILL.g, PEAK_FILL.g)} ${mix(BASE_FILL.b, PEAK_FILL.b)})`
}

function choroplethFill(value: number, maxValue: number): string {
  if (value <= 0 || maxValue <= 0) {
    return ZERO_FILL
  }
  return mixColor(Math.sqrt(value / maxValue))
}

function buildCountryStats(data: ChartDataPoint[]): Map<string, CountryStats> {
  const stats = new Map<string, CountryStats>()

  for (const point of data) {
    const atlasName = resolveAtlasName(point.label)
    if (!atlasName) {
      continue
    }

    const current = stats.get(atlasName)
    if (!current) {
      stats.set(atlasName, {
        titleCount: point.value,
        catalogName: point.label,
      })
      continue
    }

    current.titleCount += point.value
    if (point.value > current.titleCount - point.value) {
      current.catalogName = point.label
    }
  }

  return stats
}

export function WorldChoropleth({ data }: WorldChoroplethProps) {
  const { country, setCountry } = useDashboardFilters()
  const [tooltip, setTooltip] = useState<MapTooltipState | null>(null)

  const { statsByAtlas, maxValue } = useMemo(() => {
    const statsByAtlas = buildCountryStats(data)
    let maxValue = 0
    for (const stats of statsByAtlas.values()) {
      if (stats.titleCount > maxValue) {
        maxValue = stats.titleCount
      }
    }
    return { statsByAtlas, maxValue }
  }, [data])

  const handleToggle = (atlasName: string) => {
    const catalogName =
      statsByAtlas.get(atlasName)?.catalogName ?? catalogNameForAtlas(atlasName)
    setCountry(country === catalogName ? "all" : catalogName)
  }

  const showTooltip = (
    event: PointerEvent<SVGPathElement>,
    atlasName: string,
    titleCount: number,
  ) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) {
      return
    }
    const bounds = svg.getBoundingClientRect()
    setTooltip({
      text: formatCountryTooltip(atlasName, titleCount),
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }

  if (data.length === 0) {
    return <ChartEmptyState className="flex h-56 items-center justify-center text-sm text-muted-foreground sm:h-72 lg:h-80" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-56 w-full sm:h-72 lg:h-80"
          role="img"
          aria-label="Mapa de títulos por país de producción"
        >
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="transparent" />
          {countriesCollection.features.map((countryFeature) => {
              const atlasName = countryFeature.properties.name
              const stats = statsByAtlas.get(atlasName)
              const titleCount = stats?.titleCount ?? 0
              const catalogName = stats?.catalogName ?? catalogNameForAtlas(atlasName)
              const isSelected = country === catalogName
              const d = pathGenerator(
                countryFeature as unknown as GeoPermissibleObjects,
              )
              if (!d) {
                return null
              }

              return (
                <path
                  key={countryFeature.id ?? atlasName}
                  d={d}
                  fill={choroplethFill(titleCount, maxValue)}
                  stroke={isSelected ? "#E50914" : "color-mix(in oklch, var(--background) 70%, var(--border))"}
                  strokeWidth={isSelected ? 1.6 : 0.4}
                  className="cursor-pointer transition-[fill,stroke-width] hover:brightness-125"
                  onClick={() => handleToggle(atlasName)}
                  onPointerEnter={(event) =>
                    showTooltip(event, atlasName, titleCount)
                  }
                  onPointerMove={(event) =>
                    showTooltip(event, atlasName, titleCount)
                  }
                  onPointerLeave={() => setTooltip(null)}
                >
                  <title>{formatCountryTooltip(atlasName, titleCount)}</title>
                </path>
              )
          })}
        </svg>
        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            {tooltip.text}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
        <span>0 títulos</span>
        <div className="flex h-2.5 w-40 overflow-hidden rounded-sm">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="h-full flex-1"
              style={{ backgroundColor: mixColor(index / 7) }}
            />
          ))}
        </div>
        <span>Principales productores</span>
      </div>
    </div>
  )
}
