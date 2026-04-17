import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import styles from './Sidebar.module.css';

/* Sidebar — glowna nawigacja aplikacji.
   Wyswietla linki odpowiednie dla roli zalogowanego uzytkownika:
   - Wlasciciel: zwierzeta, karmienia, zabiegi
   - Lekarz: przegladanie zwierzat, zabiegi
   - Administrator: zarzadzanie uzytkownikami */

function Sidebar() {
  const { uzytkownik, rola, wyloguj } = useAuthStore();
  const navigate = useNavigate();

  const handleWyloguj = () => {
    wyloguj();
    navigate('/logowanie');
  };

  /* Funkcja pomocnicza do generowania klasy aktywnego linku */
  const getLinkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

  /* Inicjaly uzytkownika wyswietlane w awatarze */
  const inicjaly = uzytkownik
    ? `${uzytkownik.imie?.[0] || ''}${uzytkownik.nazwisko?.[0] || ''}`
    : 'UZ';

  return (
    <aside className={styles.sidebar}>
      {/* Logo i nazwa aplikacji */}
      <div className={styles.logo}>
        <div className={styles.logoTitle}>Inwentarz</div>
        <div className={styles.logoSubtitle}>System gospodarstwa</div>
      </div>

      {/* Nawigacja */}
      <nav className={styles.nav}>
        {/* Sekcja glowna — dostepna dla wszystkich zalogowanych */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Menu</div>
          <NavLink to="/" className={getLinkClass} end>
            <span className={styles.navIcon}>&#9751;</span>
            Strona glowna
          </NavLink>
        </div>

        {/* Sekcja operacyjna — rozna w zaleznosci od roli */}
        {(rola === 'Wlasciciel' || rola === 'Administrator') && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Gospodarstwo</div>
            <NavLink to="/zwierzeta" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Zwierzeta
            </NavLink>
            <NavLink to="/karmienia" className={getLinkClass}>
              <span className={styles.navIcon}>&#9671;</span>
              Karmienia
            </NavLink>
            <NavLink to="/zabiegi" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Zabiegi
            </NavLink>
          </div>
        )}

        {rola === 'Lekarz' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Weterynaria</div>
            <NavLink to="/zwierzeta" className={getLinkClass}>
              <span className={styles.navIcon}>&#9670;</span>
              Przegladanie zwierzat
            </NavLink>
            <NavLink to="/zabiegi" className={getLinkClass}>
              <span className={styles.navIcon}>&#9672;</span>
              Zabiegi
            </NavLink>
          </div>
        )}

        {/* Sekcja administracyjna */}
        {rola === 'Administrator' && (
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Administracja</div>
            <NavLink to="/admin/uzytkownicy" className={getLinkClass}>
              <span className={styles.navIcon}>&#9673;</span>
              Uzytkownicy
            </NavLink>
          </div>
        )}

        {/* Profil — dostepny dla kazdego zalogowanego */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Konto</div>
          <NavLink to="/profil" className={getLinkClass}>
            <span className={styles.navIcon}>&#9679;</span>
            Moj profil
          </NavLink>
        </div>
      </nav>

      {/* Sekcja uzytkownika na dole sidebara */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>{inicjaly}</div>
          <div>
            <div className={styles.userName}>
              {uzytkownik?.imie || 'Uzytkownik'} {uzytkownik?.nazwisko || ''}
            </div>
            <div className={styles.userRole}>{rola || 'Brak roli'}</div>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={handleWyloguj}>
          Wyloguj sie
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
