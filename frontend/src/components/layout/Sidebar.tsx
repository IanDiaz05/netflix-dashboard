import { Clapperboard } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import { appRoutes } from "@/config/navigation"
import { cn } from "@/lib/utils"

interface SidebarBrandProps {
  className?: string
}

/** Product mark shared by the desktop rail and the mobile drawer. */
export function SidebarBrand({ className }: SidebarBrandProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-4", className)}>
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
  )
}

interface SidebarNavProps {
  /** Notifies the mobile drawer so it can close after a route change. */
  onNavigate?: () => void
  className?: string
}

/** Route list shared by the desktop rail and the mobile drawer. */
export function SidebarNav({ onNavigate, className }: SidebarNavProps) {
  const location = useLocation()

  return (
    <nav
      className={cn("flex flex-1 flex-col gap-1 p-3", className)}
      aria-label="Navegación principal"
    >
      {appRoutes.map((route) => (
        <NavLink
          key={route.path}
          to={{ pathname: route.path, search: location.search }}
          end={route.path === "/"}
          onClick={onNavigate}
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
  )
}

/** Persistent desktop sidebar; hidden below the `lg` breakpoint. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 self-stretch flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <SidebarBrand />
      <Separator />
      <SidebarNav />
    </aside>
  )
}
