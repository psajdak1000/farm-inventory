import { Link } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../stores/useAuthStore';
import aiService from '../services/aiService';
import Header from '../components/layout/Header';
import { Alert, Button } from '../components/common/Common';
import styles from './HomePage.module.css';

/* HomePage — welcome view displayed after login.
   Shows quick-access tiles for the main system functions,
   tailored to the user's role. */

function HomePage() {
  const { user, role } = useAuthStore();
  const [aiMessage, setAiMessage] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiError, setAiError] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSubmit = async (event) => {
    event.preventDefault();
    setAiError(null);
    setAiAnswer('');

    const trimmed = aiMessage.trim();
    if (!trimmed) {
      setAiError('Wpisz wiadomosc do wyslania.');
      return;
    }

    setIsAiLoading(true);
    try {
      const response = await aiService.askAi(trimmed);
      setAiAnswer(response?.answer || '');
    } catch (error) {
      const message = error.response?.data?.error || 'Nie udalo sie wyslac zapytania.';
      setAiError(message);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div>
      <Header
        title={`Witaj, ${user?.firstName || 'Uzytkowniku'}`}
        subtitle="Panel zarzadzania inwentarzem w gospodarstwie"
      />

      <main className={styles.dashboard}>
        <div className={styles.cardsGrid}>
          {/* Tile — Animals */}
          {(role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz') && (
            <Link to="/animals" className={styles.card}>
              <div className={styles.cardIcon}>&#9670;</div>
              <h3 className={styles.cardTitle}>Zwierzeta</h3>
              <p className={styles.cardDescription}>
                {role === 'Lekarz'
                  ? 'Przegladaj baze zwierzat w systemie'
                  : 'Zarzadzaj ewidencja zwierzat w gospodarstwie'}
              </p>
            </Link>
          )}

          {/* Tile — Feedings */}
          {(role === 'Wlasciciel' || role === 'Administrator') && (
            <Link to="/feeding" className={styles.card}>
              <div className={styles.cardIcon}>&#9671;</div>
              <h3 className={styles.cardTitle}>Karmienia</h3>
              <p className={styles.cardDescription}>
                Rejestruj karmienia i koszty pasz
              </p>
            </Link>
          )}

          {/* Tile — Procedures */}
          {(role === 'Wlasciciel' || role === 'Administrator' || role === 'Lekarz') && (
            <Link to="/procedures" className={styles.card}>
              <div className={styles.cardIcon}>&#9672;</div>
              <h3 className={styles.cardTitle}>Zabiegi</h3>
              <p className={styles.cardDescription}>
                Zarzadzaj zabiegami weterynaryjnymi
              </p>
            </Link>
          )}

          {/* Tile — Profile */}
          <Link to="/profile" className={styles.card}>
            <div className={styles.cardIcon}>&#9679;</div>
            <h3 className={styles.cardTitle}>Moj profil</h3>
            <p className={styles.cardDescription}>Edytuj swoje dane i ustawienia konta</p>
          </Link>

          {/* Tile — Admin */}
          {role === 'Administrator' && (
            <Link to="/admin/users" className={styles.card}>
              <div className={styles.cardIcon}>&#9673;</div>
              <h3 className={styles.cardTitle}>Administracja</h3>
              <p className={styles.cardDescription}>
                Zarzadzaj uzytkownikami i uprawnieniami
              </p>
            </Link>
          )}
        </div>

        <section className={styles.aiCard}>
          <h3 className={styles.aiTitle}>Asystent AI</h3>
          <p className={styles.aiSubtitle}>Wyslij pytanie i otrzymaj odpowiedz z API.</p>

          {aiError && <Alert type="error">{aiError}</Alert>}
          {aiAnswer && <div className={styles.aiResponse}>{aiAnswer}</div>}

          <form className={styles.aiForm} onSubmit={handleAiSubmit}>
            <textarea
              className={styles.aiTextarea}
              rows={3}
              maxLength={2000}
              placeholder="Napisz wiadomosc..."
              value={aiMessage}
              onChange={(event) => setAiMessage(event.target.value)}
            />
            <div className={styles.aiActions}>
              <Button variant="primary" type="submit" disabled={isAiLoading}>
                {isAiLoading ? 'Wysylanie...' : 'Wyslij'}
              </Button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default HomePage;