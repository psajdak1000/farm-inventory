import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

/* ProtectedRoute — komponent opakowujacy trasy wymagajace zalogowania.
   Jesli uzytkownik nie jest zalogowany, przekierowuje na strone logowania.
   Opcjonalnie mozna podac dozwolone role — jesli rola uzytkownika
   nie znajduje sie na liscie, wyswietlany jest komunikat o braku dostepu. */

function ProtectedRoute({ children, allowedRoles, dozwoloneRole }) {
  const { zalogowany, rola } = useAuthStore();
  const location = useLocation();
  const rolesAllowed = allowedRoles ?? dozwoloneRole ?? [];

  /* Niezalogowany uzytkownik trafia na strone logowania */
  if (!zalogowany) {
    return <Navigate to="/logowanie" state={{ from: location }} replace />;
  }

  /* Sprawdzenie roli — jesli podano dozwolone role i uzytkownik nie ma zadnej z nich */
  if (rolesAllowed.length > 0 && !rolesAllowed.includes(rola)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
