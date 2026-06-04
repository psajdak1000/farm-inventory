import { Routes, Route } from 'react-router-dom';
import usePageTracking from './hooks/usePageTracking';

/* Layouts */
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

/* Auth pages */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* Protected pages */
import HomePage from './pages/HomePage';
import AnimalList from './pages/animals/AnimalList';
import AnimalDetails from './pages/animals/AnimalDetails';
import AnimalForm from './pages/animals/AnimalForm';
import FeedingList from './pages/feeding/FeedingList';
import FeedingForm from './pages/feeding/FeedingForm';
import ProcedureList from './pages/procedures/ProcedureList';
import ProcedureForm from './pages/procedures/ProcedureForm';
import ProfilePage from './pages/profile/ProfilePage';
import AdminPanel from './pages/admin/AdminPanel';

/* 404 page */
import NotFoundPage from './pages/NotFoundPage';

/* AppContent — inner component placed inside BrowserRouter.
   This allows using react-router-dom hooks (e.g. useLocation).
   The usePageTracking hook registers every page change in Google Analytics. */

function AppContent() {
  usePageTracking();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />

        <Route path="animals" element={<AnimalList />} />
        <Route path="animals/:id" element={<AnimalDetails />} />
        <Route path="animals/add" element={<AnimalForm />} />
        <Route path="animals/:id/edit" element={<AnimalForm />} />

        <Route path="feeding" element={<FeedingList />} />
        <Route path="feeding/add" element={<FeedingForm />} />

        <Route path="procedures" element={<ProcedureList />} />
        <Route path="procedures/add" element={<ProcedureForm />} />

        <Route path="profile" element={<ProfilePage />} />

        {/* Admin module — only for administrators */}
        <Route path="admin/users" element={<AdminPanel />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppContent;