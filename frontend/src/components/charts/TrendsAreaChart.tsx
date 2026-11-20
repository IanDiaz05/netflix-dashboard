import { useId } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartEmptyState } from "@/components/charts/ChartEmptyState"
import { ChartTooltip } from "@/components/charts/ChartTooltip"
import { chartColors, formatInteger } from "@/components/charts/chartTheme"
import type { ChartDataPoint } from "@/types/catalog"

interface TrendsAreaChartProps {
  data: ChartDataPoint[]
  series?: "both" | "releaseYear" | "dateAdded"
}

interface YearRow {
  year: string
  releaseYear: number
  dateAdded: number
}

function toYearRows(points: ChartDataPoint[]): YearRow[] {
  const byYear = new Map<string, YearRow>()

  for (const point of points) {
    const current = byYear.get(point.label) ?? {
      year: point.label,
      releaseYear: 0,
      dateAdded: 0,
    }
    if (point.category === "dateAdded") {
      current.dateAdded += point.value
    } else {
      current.releaseYear += point.value
    }
    byYear.set(point.label, current)
  }

  return [...byYear.values()].sort((left, right) =>
    left.year.localeCompare(right.year, "es", { numeric: true }),
  )
}

export function TrendsAreaChart({
  data,
  series = "both",
}: TrendsAreaChartProps) {
  const gradientId = useId().replace(/:/g, "")
  const rows = toYearRows(data)
  const showRelease = series === "both" || series === "releaseYear"
  const showAdded = series === "both" || series === "dateAdded"
  const hasValues = rows.some((row) =>
    showRelease && showAdded
      ? row.releaseYear > 0 || row.dateAdded > 0
      : showRelease
        ? row.releaseYear > 0
        : row.dateAdded > 0,
  )

  if (rows.length === 0 || !hasValues) {
    return <ChartEmptyState />
  }

  return (
    <div className="h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${gradientId}-release`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.crimson} stopOpacity={0.35} />
              <stop offset="95%" stopColor={chartColors.crimson} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${gradientId}-added`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.amber} stopOpacity={0.35} />
              <stop offset="95%" stopColor={chartColors.amber} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={chartColors.grid}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="year"
            tick={{ fill: chartColors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: chartColors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatInteger}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          {showRelease ? (
            <Area
              type="monotone"
              dataKey="releaseYear"
              name="Año de estreno"
              stroke={chartColors.crimson}
              fill={`url(#${gradientId}-release)`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ) : null}
          {showAdded ? (
            <Area
              type="monotone"
              dataKey="dateAdded"
              name="Incorporación"
              stroke={chartColors.amber}
              fill={`url(#${gradientId}-added)`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
