import type { ReactNode } from "react"
import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardFilters } from "@/hooks/useDashboardFilters"
import {
  contentFormatOptions,
  maturityRatingOptions,
  releasePeriodOptions,
} from "@/config/filters"
import type { FilterOption } from "@/config/filters"

interface FilterControlProps {
  label: string
  children: ReactNode
}

function FilterControl({ label, children }: FilterControlProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

interface FilterSelectProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: FilterOption<T>[]
  ariaLabel: string
}

function FilterSelect<T extends string>({
  value,
  onValueChange,
  options,
  ariaLabel,
}: FilterSelectProps<T>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" aria-label={ariaLabel} className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/**
 * Responsive strip of global tactical filters for the Content Marketing
 * Strategist. Selections are mirrored to URL search params through
 * `DashboardFiltersContext`, so every view reacts to changes.
 */
export function DashboardFilterBar() {
  const {
    format,
    period,
    rating,
    setFormat,
    setPeriod,
    setRating,
    clearFilters,
    hasActiveFilters,
  } = useDashboardFilters()

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-2.5">
      <FilterControl label="Formato">
        <FilterSelect
          value={format}
          onValueChange={setFormat}
          options={contentFormatOptions}
          ariaLabel="Filtrar por formato"
        />
      </FilterControl>
      <FilterControl label="Período de estreno">
        <FilterSelect
          value={period}
          onValueChange={setPeriod}
          options={releasePeriodOptions}
          ariaLabel="Filtrar por período de estreno"
        />
      </FilterControl>
      <FilterControl label="Clasificación">
        <FilterSelect
          value={rating}
          onValueChange={setRating}
          options={maturityRatingOptions}
          ariaLabel="Filtrar por clasificación de edad"
        />
      </FilterControl>
      <Button
        variant="ghost"
        size="sm"
        onClick={clearFilters}
        disabled={!hasActiveFilters}
      >
        <XIcon aria-hidden="true" />
        Limpiar filtros
      </Button>
    </div>
  )
}
