import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useZwierzeStore from '../../stores/useZwierzeStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import styles from './Zwierzeta.module.css';

/* ListaZwierzat — widok tabelaryczny wszystkich zwierzat w systemie.
   Dane sa pobierane z API przy pierwszym renderze komponentu.
   Obsluguje trzy stany: ladowanie, blad, sukces (z danymi lub pusta lista).
   Kazdy wiersz tabeli zawiera przyciski akcji: podglad, edycja, usuwanie. */

function ListaZwierzat() {
  const { zwierzeta, ladowanie, blad, pobierzWszystkie, usun } = useZwierzeStore();
  const navigate = useNavigate();
  const [usuwaneId, setUsuwaneId] = useState(null);

  /* Pobranie danych przy montowaniu komponentu */
  useEffect(() => {
    pobierzWszystkie();
  }, [pobierzWszystkie]);

  /* Obsluga usuwania — otwiera modal potwierdzenia */
  const handleUsun = async () => {
    if (usuwaneId) {
      await usun(usuwaneId);
      setUsuwaneId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        tytul="Zwierzeta"
        podtytul="Lista wszystkich zwierzat w gospodarstwie"
      >
        <Button wariant="primary" onClick={() => navigate('/zwierzeta/dodaj')}>
          Dodaj zwierze
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {/* Stan ladowania */}
        {ladowanie && <Loader tekst="Pobieranie listy zwierzat..." />}

        {/* Stan bledu */}
        {blad && <Alert typ="error">{blad}</Alert>}

        {/* Stan pustej listy */}
        {!ladowanie && !blad && zwierzeta.length === 0 && (
          <EmptyState
            tytul="Brak zwierzat"
            opis="Nie dodano jeszcze zadnego zwierzecia do systemu. Kliknij przycisk powyzej, aby dodac pierwsze zwierze."
          />
        )}

        {/* Tabela z danymi */}
        {!ladowanie && !blad && zwierzeta.length > 0 && (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nr kolczyka</th>
                  <th>Rasa</th>
                  <th>Plec</th>
                  <th>Wiek</th>
                  <th>Waga (kg)</th>
                  <th>Data zakupu/urodzenia</th>
                  <th style={{ textAlign: 'right' }}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {zwierzeta.map((zwierze) => (
                  <tr key={zwierze.idZwierzecia}>
                    <td>{zwierze.identyfikatorKolczyka}</td>
                    <td>{zwierze.rasa}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          zwierze.plec === 'Samiec' ? styles.badgeMale : styles.badgeFemale
                        }`}
                      >
                        {zwierze.plec}
                      </span>
                    </td>
                    <td>{zwierze.wiek} lat</td>
                    <td>{zwierze.waga}</td>
                    <td>{zwierze.dataZakupuUrodzenia}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Link
                          to={`/zwierzeta/${zwierze.idZwierzecia}`}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          Podglad
                        </Link>
                        <Link
                          to={`/zwierzeta/${zwierze.idZwierzecia}/edytuj`}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          Edytuj
                        </Link>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => setUsuwaneId(zwierze.idZwierzecia)}
                        >
                          Usun
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal potwierdzenia usuwania */}
      {usuwaneId && (
        <ConfirmModal
          tytul="Usuwanie zwierzecia"
          tresc="Czy na pewno chcesz usunac to zwierze? Tej operacji nie mozna cofnac."
          onPotwierdz={handleUsun}
          onAnuluj={() => setUsuwaneId(null)}
          ladowanie={ladowanie}
        />
      )}
    </div>
  );
}

export default ListaZwierzat;
