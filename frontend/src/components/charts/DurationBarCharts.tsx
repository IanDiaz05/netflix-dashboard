import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartEmptyState } from "@/components/charts/ChartEmptyState"
import { ChartTooltip } from "@/components/charts/ChartTooltip"
import { chartColors, formatInteger } from "@/components/charts/chartTheme"
import type { ChartDataPoint, DurationDistribution } from "@/types/catalog"

interface DurationBarChartsProps {
  data: DurationDistribution
}

interface DurationPanelChartProps {
  points: ChartDataPoint[]
  fill: string
  valueSuffix: string
}

function DurationPanelChart({
  points,
  fill,
  valueSuffix,
}: DurationPanelChartProps) {
  if (points.length === 0) {
    return (
      <ChartEmptyState className="flex h-36 items-center justify-center text-sm text-muted-foreground" />
    )
  }

  const bars = points.map((point) => ({
    name: point.label,
    titles: point.value,
  }))

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid
            stroke={chartColors.grid}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: chartColors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: chartColors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={formatInteger}
          />
          <Tooltip
            content={<ChartTooltip valueSuffix={valueSuffix} />}
            cursor={{ fill: "color-mix(in oklch, var(--muted) 70%, transparent)" }}
          />
          <Bar
            dataKey="titles"
            name="Títulos"
            fill={fill}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DurationBarCharts({ data }: DurationBarChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <span className="text-xs text-muted-foreground">
          Duración de películas (minutos)
        </span>
        <DurationPanelChart
          points={data.minutes}
          fill={chartColors.crimson}
          valueSuffix="títulos"
        />
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <span className="text-xs text-muted-foreground">
          Temporadas por serie
        </span>
        <DurationPanelChart
          points={data.seasons}
          fill={chartColors.slate}
          valueSuffix="títulos"
        />
      </div>
    </div>
  )
}
