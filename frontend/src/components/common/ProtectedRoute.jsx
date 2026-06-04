import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

/* ProtectedRoute — component wrapping routes that require login.
   If the user is not logged in, redirects to the login page.
   Optionally you can provide allowedRoles — if the user's role
   is not in the list, an access-denied redirect is shown. */

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isLoggedIn, role } = useAuthStore();
  const location = useLocation();

  /* Unauthenticated user is sent to the login page */
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* Role check — if allowed roles are given and the user has none of them */
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;