import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

/* NotFoundPage — displayed when the user navigates to a non-existent URL.
   Fulfills the 404 route handling requirement from the project requirements document. */

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Strona nie znaleziona</h1>
        <p className={styles.description}>
          Podany adres nie istnieje lub zostal przeniesiony.
          Sprawdz poprawnosc adresu URL lub wroc na strone glowna.
        </p>
        <Link to="/" className={styles.link}>
          Wroc na strone glowna
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;