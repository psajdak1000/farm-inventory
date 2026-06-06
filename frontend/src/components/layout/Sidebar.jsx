import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import styles from './Sidebar.module.css';

/* Sidebar — main application navigation.
   Displays links appropriate for the logged-in user's role:
   - Wlasciciel: animals, feedings, procedures
   - Lekarz: browse animals, procedures
   - Administrator: user management */

function Sidebar() {
  const { user, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const canAccessFarmSection =
    role === 'Wlasciciel' || role === 'Administrator' || role === 'User';
  const canAccessVetSection = role === 'Lekarz';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* Helper function for generating the active link class */
  const getLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  /* User initials displayed in the avatar */
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'UZ';

  return (
    <aside className={styles.sidebar}>
      {/* Logo and application name */}
      <div className={styles.logo}>
        <div className={styles.logoTitle}>Inwentarz</div>
        <div className={styles.logoSubtitle}>System gospodarstwa</div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {/* Main section — available to all logged-in users */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Menu</div>
          <NavLink to="/" className={getLinkClass} end>
            <span className={styles.navIcon}>&#9751;</span>
            Strona glowna
          </NavLink>
        </div>

        {/* Operational section — varies by role */}
        {canAccessFarmSection && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Gospodarstwo</div>
            <NavLink to="/animals" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Zwierzeta
            </NavLink>
            <NavLink to="/feeding" className={getLinkClass}>
              <span className={styles.navIcon}>&#9671;</span>
              Karmienia
            </NavLink>
            <NavLink to="/procedures" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Zabiegi
            </NavLink>
          </div>
        )}

        {canAccessVetSection && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Weterynaria</div>
            <NavLink to="/animals" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Przegladanie zwierzat
            </NavLink>
            <NavLink to="/procedures" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Zabiegi
            </NavLink>
          </div>
        )}

        {/* Admin section */}
        {role === 'Administrator' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Administracja</div>
            <NavLink to="/admin/users" className={getLinkClass}>
              <span className={styles.navIcon}>&#9673;</span>
              Uzytkownicy
            </NavLink>
          </div>
        )}

        {/* Profile — available to every logged-in user */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Konto</div>
          <NavLink to="/profile" className={getLinkClass}>
            <span className={styles.navIcon}>&#9679;</span>
            Moj profil
          </NavLink>
        </div>
      </nav>

      {/* User section at the bottom of the sidebar */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{initials}</div>
          <div>
            <div className={styles.userName}>
              {user?.firstName || 'Uzytkownik'} {user?.lastName || ''}
            </div>
            <div className={styles.userRole}>{role || 'Brak roli'}</div>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleLogout}>
          Wyloguj sie
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
