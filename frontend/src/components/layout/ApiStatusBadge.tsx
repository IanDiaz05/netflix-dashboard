import { Badge } from "@/components/ui/badge"
import { usePendingResource } from "@/hooks/usePendingResource"
import { pingHealth } from "@/services/apiClient"

export function ApiStatusBadge() {
  const { error, isLoading } = usePendingResource(() => pingHealth(), [])

  if (isLoading) {
    return (
      <Badge variant="outline" className="shrink-0 gap-1.5">
        <span
          className="size-1.5 rounded-full bg-muted-foreground/70"
          aria-hidden="true"
        />
        Conectando
      </Badge>
    )
  }

  if (error) {
    return (
      <Badge variant="outline" className="shrink-0 gap-1.5">
        <span
          className="size-1.5 rounded-full bg-destructive"
          aria-hidden="true"
        />
        Sin conexión
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="shrink-0 gap-1.5">
      <span
        className="size-1.5 rounded-full bg-chart-emerald"
        aria-hidden="true"
      />
      Catálogo activo
    </Badge>
  )
}
