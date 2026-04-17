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

function AnimalListPage() {
  const {
    zwierzeta: animals,
    ladowanie: isLoading,
    blad: error,
    pobierzWszystkie: fetchAllAnimals,
    usun: deleteAnimal,
  } = useZwierzeStore();
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  /* Pobranie danych przy montowaniu komponentu */
  useEffect(() => {
    fetchAllAnimals();
  }, [fetchAllAnimals]);

  /* Obsluga usuwania — otwiera modal potwierdzenia */
  const handleDelete = async () => {
    if (pendingDeleteId) {
      await deleteAnimal(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        tytul="Animals"
        podtytul="List of all animals on the farm"
      >
        <Button wariant="primary" onClick={() => navigate('/zwierzeta/dodaj')}>
          Add animal
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {/* Stan ladowania */}
        {isLoading && <Loader tekst="Loading animal list..." />}

        {/* Stan bledu */}
        {error && <Alert typ="error">{error}</Alert>}

        {/* Stan pustej listy */}
        {!isLoading && !error && animals.length === 0 && (
          <EmptyState
            tytul="No animals"
            opis="No animals have been added yet. Click the button above to add the first one."
          />
        )}

        {/* Tabela z danymi */}
        {!isLoading && !error && animals.length > 0 && (
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ear tag no.</th>
                  <th>Breed</th>
                  <th>Sex</th>
                  <th>Age</th>
                  <th>Weight (kg)</th>
                  <th>Purchase/Birth date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {animals.map((animal) => (
                  <tr key={animal.idZwierzecia}>
                    <td>{animal.identyfikatorKolczyka}</td>
                    <td>{animal.rasa}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          animal.plec === 'Samiec' ? styles.badgeMale : styles.badgeFemale
                        }`}
                      >
                        {animal.plec}
                      </span>
                    </td>
                    <td>{animal.wiek} years</td>
                    <td>{animal.waga}</td>
                    <td>{animal.dataZakupuUrodzenia}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Link
                          to={`/zwierzeta/${animal.idZwierzecia}`}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          View
                        </Link>
                        <Link
                          to={`/zwierzeta/${animal.idZwierzecia}/edytuj`}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          Edit
                        </Link>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => setPendingDeleteId(animal.idZwierzecia)}
                        >
                          Delete
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
      {pendingDeleteId && (
        <ConfirmModal
          tytul="Delete animal"
          tresc="Are you sure you want to delete this animal? This action cannot be undone."
          onPotwierdz={handleDelete}
          onAnuluj={() => setPendingDeleteId(null)}
          ladowanie={isLoading}
        />
      )}
    </div>
  );
}

export default AnimalListPage;
