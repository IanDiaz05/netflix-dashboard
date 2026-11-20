interface ChartEmptyStateProps {
  className?: string
}

export function ChartEmptyState({ className }: ChartEmptyStateProps) {
  return (
    <p
      className={
        className ??
        "flex h-56 items-center justify-center text-sm text-muted-foreground sm:h-64"
      }
    >
      No hay datos para los filtros seleccionados
    </p>
  )
}
