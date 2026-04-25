import { Routes, Route } from 'react-router-dom';
import usePageTracking from './hooks/usePageTracking';

/* Layouty */
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

/* Strony autoryzacji */
import LoginPage from './pages/auth/LoginPage';
import RegistrationPage from './pages/auth/RegistrationPage';

/* Strony chronione */
import HomePage from './pages/HomePage';
import KpiDashboardPage from './pages/KpiDashboardPage';
import ListaZwierzat from './pages/zwierzeta/ListaZwierzat';
import SzczegolyZwierzecia from './pages/zwierzeta/SzczegolyZwierzecia';
import FormularzZwierzecia from './pages/zwierzeta/FormularzZwierzecia';
import ListaKarmien from './pages/karmienia/ListaKarmien';
import FormularzKarmienia from './pages/karmienia/FormularzKarmienia';
import ListaZabiegow from './pages/zabiegi/ListaZabiegow';
import FormularzZabiegu from './pages/zabiegi/FormularzZabiegu';
import ProfilePage from './pages/profil/ProfilePage';
import AdminPanelPage from './pages/admin/AdminPanelPage';

/* Strona 404 */
import NotFoundPage from './pages/NotFoundPage';

/* AppContent — komponent wewnetrzny umieszczony wewnatrz BrowserRouter.
   Dzieki temu moze korzystac z hookow react-router-dom (np. useLocation).
   Hook usePageTracking rejestruje kazda zmiane strony w Google Analytics. */

function AppContent() {
  usePageTracking();

  return (
    <Routes>
      {/* Trasy publiczne */}
      <Route path="/logowanie" element={<LoginPage />} />
      <Route path="/rejestracja" element={<RegistrationPage />} />

      {/* Trasy chronione */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="kpi" element={<KpiDashboardPage />} />

        <Route path="zwierzeta" element={<ListaZwierzat />} />
        <Route path="zwierzeta/:id" element={<SzczegolyZwierzecia />} />
        <Route path="zwierzeta/dodaj" element={<FormularzZwierzecia />} />
        <Route path="zwierzeta/:id/edytuj" element={<FormularzZwierzecia />} />

        <Route path="karmienia" element={<ListaKarmien />} />
        <Route path="karmienia/dodaj" element={<FormularzKarmienia />} />

        <Route path="zabiegi" element={<ListaZabiegow />} />
        <Route path="zabiegi/dodaj" element={<FormularzZabiegu />} />

        <Route path="profil" element={<ProfilePage />} />

        {/* Modul administracyjny — tylko dla administratorow */}
        <Route path="admin/uzytkownicy" element={<AdminPanelPage />} />
      </Route>

      {/* Trasa 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppContent;
