import Header from '../../components/layout/Header';
import { Alert } from '../../components/common/Common';
import styles from './Admin.module.css';

/* AdminPanelPage — user management view for administrators. */

function AdminPanelPage() {
  return (
    <div>
      <Header
        title="Admin panel"
        subtitle="Manage users and permissions"
      />

      <div className={styles.adminPage}>
        <Alert type="info">
          The admin panel will be fully enabled after backend endpoints for user
          management, role assignment, and account blocking are integrated.
        </Alert>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Owners</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Veterinarians</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Animals</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Treatments</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanelPage;
