import { useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DashboardFilterBar } from "@/components/layout/DashboardFilterBar"
import { appRoutes } from "@/config/navigation"

export function Header() {
  const location = useLocation()
  const currentRoute =
    appRoutes.find((route) => route.path === location.pathname) ?? appRoutes[0]

  return (
    <header className="flex flex-col border-b border-border bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <h1 className="text-sm font-medium tracking-tight">
          {currentRoute.title}
        </h1>
        <Badge variant="outline">Backend pendiente</Badge>
      </div>
      <Separator />
      <DashboardFilterBar />
    </header>
  )
}
