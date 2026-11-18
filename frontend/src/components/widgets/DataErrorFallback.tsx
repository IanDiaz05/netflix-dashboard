import { AlertCircleIcon, RotateCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataErrorFallbackProps {
  onRetry: () => void
  className?: string
}

/**
 * Inline error state for data widgets.
 * Keeps the surrounding card chrome intact so a failed resource
 * does not break the rest of the dashboard layout.
 */
export function DataErrorFallback({
  onRetry,
  className,
}: DataErrorFallbackProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center",
        className,
      )}
    >
      <AlertCircleIcon className="size-4 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium text-destructive">
        Error al cargar los datos
      </p>
      <p className="text-xs text-muted-foreground">
        No se pudo contactar el servicio de datos.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
        <RotateCwIcon aria-hidden="true" />
        Reintentar
      </Button>
    </div>
  )
}
