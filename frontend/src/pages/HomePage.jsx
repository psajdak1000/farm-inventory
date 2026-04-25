import { Link } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import Header from '../components/layout/Header';
import styles from './StronaGlowna.module.css';

/* HomePage — welcome dashboard shown after sign in.
   Displays quick-access cards based on the user role. */

function HomePage() {
  const { uzytkownik: user, rola: role } = useAuthStore();

  const canSeeAnimals = role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz';
  const canSeeFeedings = role === 'Wlasciciel' || role === 'Administrator';
  const canSeeTreatments = role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz';

  return (
    <div>
      <Header
        title={`Welcome, ${user?.imie || 'User'}`}
        subtitle="Farm inventory management panel"
      />

      <main className={styles.dashboard}>
        <div className={styles.cardsGrid}>
          {/* Card — Animals */}
          {canSeeAnimals && (
            <Link to="/zwierzeta" className={styles.card}>
              <div className={styles.cardIcon}>&#9670;</div>
              <h3 className={styles.cardTitle}>Animals</h3>
              <p className={styles.cardDescription}>
                {role === 'Lekarz'
                  ? 'Browse the animal records in the system'
                  : 'Manage animal records on the farm'}
              </p>
            </Link>
          )}

          {/* Card — Feedings */}
          {canSeeFeedings && (
            <Link to="/karmienia" className={styles.card}>
              <div className={styles.cardIcon}>&#9671;</div>
              <h3 className={styles.cardTitle}>Feedings</h3>
              <p className={styles.cardDescription}>
                Record feeding events and feed costs
              </p>
            </Link>
          )}

          {/* Card — Treatments */}
          {canSeeTreatments && (
            <Link to="/zabiegi" className={styles.card}>
              <div className={styles.cardIcon}>&#9672;</div>
              <h3 className={styles.cardTitle}>Treatments</h3>
              <p className={styles.cardDescription}>
                Manage veterinary procedures
              </p>
            </Link>
          )}

          {/* Card — Profile */}
          <Link to="/profil" className={styles.card}>
            <div className={styles.cardIcon}>&#9679;</div>
            <h3 className={styles.cardTitle}>My profile</h3>
            <p className={styles.cardDescription}>Edit your personal details and account settings</p>
          </Link>

          {/* Card — Administration */}
          {role === 'Administrator' && (
            <Link to="/admin/uzytkownicy" className={styles.card}>
              <div className={styles.cardIcon}>&#9673;</div>
              <h3 className={styles.cardTitle}>Administration</h3>
              <p className={styles.cardDescription}>
                Manage users and permissions
              </p>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
