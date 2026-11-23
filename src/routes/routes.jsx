import { Navigate, Route, Routes } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout/AuthLayout.jsx'
import MainLayout from '../layouts/MainLayout/MainLayout.jsx'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute.jsx'
import DashboardPage from '../pages/DashboardPage/DashboardPage.jsx'
import LoginPage from '../pages/LoginPage/LoginPage.jsx'
import ConsultaSuscriptorPage from '../pages/ConsultaSuscriptorPage/ConsultaSuscriptorPage.jsx'
import VerificarReciboPage from '../pages/VerificarReciboPage/VerificarReciboPage.jsx'
import SuscriptoresPage from '../pages/SuscriptoresPage/SuscriptoresPage.jsx'
import SuscriptorDetallePage from '../pages/SuscriptorDetallePage/SuscriptorDetallePage.jsx'
import PrediosPage from '../pages/PrediosPage/PrediosPage.jsx'
import SectoresPage from '../pages/SectoresPage/SectoresPage.jsx'
import TiposPredioPage from '../pages/TiposPredioPage/TiposPredioPage.jsx'
import TarifasPage from '../pages/TarifasPage/TarifasPage.jsx'
import FacturasPage from '../pages/FacturasPage/FacturasPage.jsx'
import PagosPage from '../pages/PagosPage/PagosPage.jsx'
import EstadisticasPage from '../pages/EstadisticasPage/EstadisticasPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/consulta" replace />} />
      <Route path="/consulta" element={<ConsultaSuscriptorPage />} />
      <Route path="/verificar-recibo" element={<VerificarReciboPage />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<DashboardPage />} />
        <Route path="/estadisticas" element={<EstadisticasPage />} />
        <Route path="/gestion/suscriptores" element={<SuscriptoresPage />} />
        <Route path="/gestion/suscriptores/:id" element={<SuscriptorDetallePage />} />
        <Route path="/predios" element={<PrediosPage />} />
        <Route path="/catalogos/sectores" element={<SectoresPage />} />
        <Route path="/catalogos/tipos-predio" element={<TiposPredioPage />} />
        <Route path="/catalogos/tarifas" element={<TarifasPage />} />
        <Route path="/facturas" element={<FacturasPage />} />
        <Route path="/pagos" element={<PagosPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/consulta" replace />} />
    </Routes>
  )
}

export default AppRoutes