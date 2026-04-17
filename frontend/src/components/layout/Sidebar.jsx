import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import styles from './Sidebar.module.css';

/* Sidebar — glowna nawigacja aplikacji.
   Wyswietla linki odpowiednie dla roli zalogowanego uzytkownika:
   - Wlasciciel: zwierzeta, karmienia, zabiegi
   - Lekarz: przegladanie zwierzat, zabiegi
   - Administrator: zarzadzanie uzytkownikami */

function Sidebar() {
  const { uzytkownik: user, rola: role, wyloguj: logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/logowanie');
  };

  /* Funkcja pomocnicza do generowania klasy aktywnego linku */
  const getLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  /* Inicjaly uzytkownika wyswietlane w awatarze */
  const userInitials = user
    ? `${user.imie?.[0] || ''}${user.nazwisko?.[0] || ''}`
    : 'UZ';

  return (
    <aside className={styles.sidebar}>
      {/* Logo i nazwa aplikacji */}
      <div className={styles.logo}>
        <div className={styles.logoTitle}>Inwentarz</div>
        <div className={styles.logoSubtitle}>Farm system</div>
      </div>

      {/* Nawigacja */}
      <nav className={styles.nav}>
        {/* Sekcja glowna — dostepna dla wszystkich zalogowanych */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Menu</div>
          <NavLink to="/" className={getLinkClass} end>
            <span className={styles.navIcon}>&#9751;</span>
            Home
          </NavLink>
        </div>

        {/* Sekcja operacyjna — rozna w zaleznosci od roli */}
        {(role === 'Wlasciciel' || role === 'Administrator') && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Farm</div>
            <NavLink to="/zwierzeta" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Animals
            </NavLink>
            <NavLink to="/karmienia" className={getLinkClass}>
              <span className={styles.navIcon}>&#9671;</span>
              Feedings
            </NavLink>
            <NavLink to="/zabiegi" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Treatments
            </NavLink>
          </div>
        )}

        {role === 'Lekarz' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Veterinary</div>
            <NavLink to="/zwierzeta" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Browse animals
            </NavLink>
            <NavLink to="/zabiegi" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Treatments
            </NavLink>
          </div>
        )}

        {/* Sekcja administracyjna */}
        {role === 'Administrator' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Administration</div>
            <NavLink to="/admin/uzytkownicy" className={getLinkClass}>
              <span className={styles.navIcon}>&#9673;</span>
              Users
            </NavLink>
          </div>
        )}

        {/* Profil — dostepny dla kazdego zalogowanego */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Account</div>
          <NavLink to="/profil" className={getLinkClass}>
            <span className={styles.navIcon}>&#9679;</span>
            My profile
          </NavLink>
        </div>
      </nav>

      {/* Sekcja uzytkownika na dole sidebara */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{userInitials}</div>
          <div>
            <div className={styles.userName}>
              {user?.imie || 'User'} {user?.nazwisko || ''}
            </div>
            <div className={styles.userRole}>{role || 'No role'}</div>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
