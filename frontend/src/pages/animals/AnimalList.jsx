import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAnimalStore from '../../stores/useAnimalStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import styles from './Animals.module.css';

/* AnimalList — tabular view of all animals in the system.
   Data is fetched from the API on first component render.
   Handles three states: loading, error, success (with data or empty list).
   Each table row contains action buttons: preview, edit, delete. */

function AnimalList() {
  const { animals, isLoading, error, fetchAll, remove } = useAnimalStore();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  /* Fetch data on component mount */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* Handle delete — opens the confirmation modal */
  const handleDelete = async () => {
    if (deletingId) {
      await remove(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header
        title="Zwierzeta"
        subtitle="Lista wszystkich zwierzat w gospodarstwie"
      >
        <Button variant="primary" onClick={() => navigate('/animals/add')}>
          Dodaj zwierze
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {/* Loading state */}
        {isLoading && <Loader text="Pobieranie listy zwierzat..." />}

        {/* Error state */}
        {error && <Alert type="error">{error}</Alert>}

        {/* Empty list state */}
        {!isLoading && !error && animals.length === 0 && (
          <EmptyState
            title="Brak zwierzat"
            description="Nie dodano jeszcze zadnego zwierzecia do systemu. Kliknij przycisk powyzej, aby dodac pierwsze zwierze."
          />
        )}

        {/* Data table */}
        {!isLoading && !error && animals.length > 0 && (
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
                {animals.map((animal) => (
                  <tr key={animal.animalId}>
                    <td>{animal.eartagId}</td>
                    <td>{animal.breed}</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          animal.gender === 'Samiec' ? styles.badgeMale : styles.badgeFemale
                        }`}
                      >
                        {animal.gender}
                      </span>
                    </td>
                    <td>{animal.age} lat</td>
                    <td>{animal.weight}</td>
                    <td>{animal.purchaseOrBirthDate}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <Link
                          to={`/animals/${animal.animalId}`}
                          className={`${styles.actionButton} ${styles.viewButton}`}
                        >
                          Podglad
                        </Link>
                        <Link
                          to={`/animals/${animal.animalId}/edit`}
                          className={`${styles.actionButton} ${styles.editButton}`}
                        >
                          Edytuj
                        </Link>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => setDeletingId(animal.animalId)}
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

      {/* Delete confirmation modal */}
      {deletingId && (
        <ConfirmModal
          title="Usuwanie zwierzecia"
          content="Czy na pewno chcesz usunac to zwierze? Tej operacji nie mozna cofnac."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default AnimalList;