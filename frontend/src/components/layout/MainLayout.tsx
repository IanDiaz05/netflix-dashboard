import { Outlet } from "react-router-dom"
import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"

export function MainLayout() {
  return (
    <div className="flex h-dvh bg-background text-foreground">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
