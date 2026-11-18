export interface AppRoute {
  path: string
  label: string
  title: string
}

export const appRoutes: AppRoute[] = [
  {
    path: "/",
    label: "Resumen",
    title: "Resumen del catálogo",
  },
  {
    path: "/trends",
    label: "Tendencias",
    title: "Tendencias temporales",
  },
  {
    path: "/geography",
    label: "Geografía",
    title: "Distribución geográfica",
  },
  {
    path: "/catalog",
    label: "Catálogo",
    title: "Explorador del catálogo",
  },
]
