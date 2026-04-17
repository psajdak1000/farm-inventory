import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

/* MainLayout — uklad aplikacji po zalogowaniu.
   Renderuje sidebar po lewej stronie i tresc widoku (Outlet) po prawej.
   Kazda podstrona chroniona jest wyswietlana wewnatrz tego layoutu. */

function MainLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
