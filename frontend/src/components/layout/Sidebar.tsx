import { Clapperboard } from "lucide-react"
import { NavLink } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { appRoutes } from "@/config/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 self-stretch flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Clapperboard className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">Analítica Netflix</p>
          <p className="truncate text-xs text-muted-foreground">
            Estrategia de contenido
          </p>
        </div>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegación principal">
        {appRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.path === "/"}
            className={({ isActive }) =>
              cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
