import { useState } from "react"
import { MenuIcon } from "lucide-react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ApiStatusBadge } from "@/components/layout/ApiStatusBadge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DashboardFilterBar } from "@/components/layout/DashboardFilterBar"
import { SidebarBrand, SidebarNav } from "@/components/layout/Sidebar"
import { appRoutes } from "@/config/navigation"

export function Header() {
  const location = useLocation()
  const [isNavOpen, setIsNavOpen] = useState(false)
  const currentRoute =
    appRoutes.find((route) => route.path === location.pathname) ?? appRoutes[0]

  return (
    <header className="flex flex-col border-b border-border bg-background">
      <div className="flex min-h-14 items-center gap-2 px-4 py-2 sm:gap-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon-sm"
          className="-ml-2 lg:hidden"
          onClick={() => setIsNavOpen(true)}
          aria-label="Abrir menú de navegación"
          aria-haspopup="dialog"
        >
          <MenuIcon className="size-4" aria-hidden="true" />
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight">
          {currentRoute.title}
        </h1>
        <ApiStatusBadge />
      </div>
      <Separator />
      <DashboardFilterBar />

      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] gap-0 p-0">
          <SheetHeader className="border-b p-0">
            <SheetTitle className="sr-only">Navegación principal</SheetTitle>
            <SheetDescription className="sr-only">
              Selecciona una sección del panel de analítica.
            </SheetDescription>
            <SidebarBrand className="pr-12" />
          </SheetHeader>
          <SidebarNav onNavigate={() => setIsNavOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  )
}
