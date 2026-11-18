import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MainLayout } from "@/components/layout/MainLayout"
import { CatalogPage } from "@/pages/CatalogPage"
import { GeographyPage } from "@/pages/GeographyPage"
import { OverviewPage } from "@/pages/OverviewPage"
import { TrendsPage } from "@/pages/TrendsPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/geography" element={<GeographyPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
