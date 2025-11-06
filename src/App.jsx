import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/Dashboard'
import { PerkebunanPage } from './pages/Perkebunan'
import { PabrikPage } from './pages/Pabrik'
import { PerusahaanPage } from './pages/Perusahaan'
import { PanduanPage } from './pages/Panduan'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/perkebunan" element={<PerkebunanPage />} />
        <Route path="/pabrik" element={<PabrikPage />} />
        <Route path="/perusahaan" element={<PerusahaanPage />} />
        <Route path="/panduan" element={<PanduanPage />} />
      </Routes>
    </AppLayout>
  )
}

export default App
