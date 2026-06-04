import * as Sentry from '@sentry/react';
import Header from '../../components/layout/Header';
import { Alert } from '../../components/common/Common';
import styles from './Admin.module.css';

/* AdminPanel — user management view for the system.
   Corresponds to the administration module from the UML diagram.
   Available only to users with the Administrator role. */

function AdminPanel() {
  return (
    <div>
      <Header
        title="Panel administracyjny"
        subtitle="Zarzadzanie uzytkownikami i uprawnieniami"
      />

      <div className={styles.adminPage}>
        <Alert type="info">
          Panel administracyjny zostanie uruchomiony po podlaczeniu endpointow backendu
          odpowiedzialnych za zarzadzanie uzytkownikami, nadawanie rol oraz blokowanie kont.
        </Alert>

        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => Sentry.captureException(new Error('Test Sentry Error!'))}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#e53e3e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Test Error (Sentry)
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Wlasciciele</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Lekarze</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Zwierzeta</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>—</div>
            <div className={styles.statLabel}>Zabiegi</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;