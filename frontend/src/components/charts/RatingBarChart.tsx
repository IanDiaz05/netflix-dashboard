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
import type { ChartDataPoint } from "@/types/catalog"

interface RatingBarChartProps {
  data: ChartDataPoint[]
}

export function RatingBarChart({ data }: RatingBarChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState />
  }

  const bars = data.map((point) => ({
    name: point.label,
    titles: point.value,
  }))

  return (
    <div className="h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
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
            angle={-35}
            textAnchor="end"
            height={48}
          />
          <YAxis
            tick={{ fill: chartColors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={formatInteger}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "color-mix(in oklch, var(--muted) 70%, transparent)" }}
          />
          <Bar
            dataKey="titles"
            name="Títulos"
            fill={chartColors.crimson}
            radius={[4, 4, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
