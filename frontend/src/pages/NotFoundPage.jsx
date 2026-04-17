import { Link } from 'react-router-dom';
import styles from './Strona404.module.css';

/* NotFoundPage — shown when the user opens a non-existent URL. */

function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.description}>
          The requested address does not exist or has been moved.
          Check the URL or return to the home page.
        </p>
        <Link to="/" className={styles.link}>
          Back to home page
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
