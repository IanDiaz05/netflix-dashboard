import { formatInteger } from "@/components/charts/chartTheme"

interface TooltipRow {
  name?: string
  value?: number | string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  label?: string | number
  payload?: TooltipRow[]
  valueSuffix?: string
}

export function ChartTooltip({
  active,
  label,
  payload,
  valueSuffix,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {label !== undefined && label !== "" ? (
        <p className="mb-1.5 font-medium">{String(label)}</p>
      ) : null}
      <ul className="flex flex-col gap-1">
        {payload.map((entry) => {
          const numeric =
            typeof entry.value === "number"
              ? entry.value
              : Number(entry.value ?? 0)
          return (
            <li key={entry.name} className="flex items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-sm"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="ml-auto font-medium tabular-nums">
                {formatInteger(numeric)}
                {valueSuffix ? ` ${valueSuffix}` : ""}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
