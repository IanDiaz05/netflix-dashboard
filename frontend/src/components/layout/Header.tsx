import { useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { appRoutes } from "@/config/navigation"

export function Header() {
  const location = useLocation()
  const currentRoute =
    appRoutes.find((route) => route.path === location.pathname) ?? appRoutes[0]

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <h1 className="text-sm font-medium tracking-tight">{currentRoute.title}</h1>
      <Badge variant="outline">Backend pendiente</Badge>
    </header>
  )
}
