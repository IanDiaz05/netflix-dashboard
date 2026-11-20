import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartEmptyState } from "@/components/charts/ChartEmptyState"
import { ChartTooltip } from "@/components/charts/ChartTooltip"
import {
  chartColors,
  formatContentTypeLabel,
  formatInteger,
} from "@/components/charts/chartTheme"
import type { ChartDataPoint } from "@/types/catalog"

interface FormatDonutChartProps {
  data: ChartDataPoint[]
}

const SLICE_COLORS: Record<string, string> = {
  Movie: chartColors.crimson,
  "TV Show": chartColors.emerald,
}

export function FormatDonutChart({ data }: FormatDonutChartProps) {
  const total = data.reduce((sum, point) => sum + point.value, 0)

  if (data.length === 0 || total === 0) {
    return <ChartEmptyState />
  }

  const slices = data.map((point) => ({
    ...point,
    name: formatContentTypeLabel(point.label),
    fill: SLICE_COLORS[point.label] ?? chartColors.slate,
    percent: point.value / total,
  }))

  return (
    <div className="flex h-56 flex-col gap-3 sm:h-64 sm:flex-row sm:items-center">
      <div className="h-40 w-full min-w-0 flex-1 sm:h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {slices.map((slice) => (
                <Cell key={slice.label} fill={slice.fill} />
              ))}
            </Pie>
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "transparent" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex shrink-0 flex-col gap-2 sm:w-44">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-start gap-2 text-xs">
            <span
              className="mt-1 size-2 shrink-0 rounded-sm"
              style={{ backgroundColor: slice.fill }}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="block font-medium text-foreground">
                {slice.name}
              </span>
              <span className="text-muted-foreground">
                {formatInteger(slice.value)} títulos ·{" "}
                {Math.round(slice.percent * 100)} %
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
