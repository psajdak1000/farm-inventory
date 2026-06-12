import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAnimalStore from '../../stores/useAnimalStore';
import useAuthStore from '../../stores/useAuthStore';
import farmService from '../../services/farmService';
import ownerService from '../../services/ownerService';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import { isAdminRole, resolveAccessibleFarms } from '../../utils/ownershipScope';
import styles from './Animals.module.css';

function AnimalList() {
  const { animals, isLoading, error, fetchAll, remove } = useAnimalStore();
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [allowedFarmIds, setAllowedFarmIds] = useState(new Set());
  const [scopeError, setScopeError] = useState(null);
  const [isScopeLoading, setIsScopeLoading] = useState(false);

  const adminRole = isAdminRole(role);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    let isMounted = true;

    const loadScope = async () => {
      if (adminRole) {
        setAllowedFarmIds(new Set());
        setScopeError(null);
        return;
      }

      setIsScopeLoading(true);
      setScopeError(null);

      try {
        const [farms, owners] = await Promise.all([farmService.fetchAll(), ownerService.fetchAll()]);

        if (!isMounted) {
          return;
        }

        const scoped = resolveAccessibleFarms({
          farms,
          owners,
          role,
          userEmail: user?.email,
        });

        setAllowedFarmIds(
          new Set(
            scoped.farms
              .map((farm) => Number(farm?.id))
              .filter((farmId) => Number.isInteger(farmId) && farmId > 0)
          )
        );
        setScopeError(scoped.scopeError);
      } catch (scopeLoadError) {
        if (isMounted) {
          setScopeError(
            scopeLoadError instanceof Error
              ? scopeLoadError.message
              : 'Nie udalo sie pobrac zakresu gospodarstw.'
          );
        }
      } finally {
        if (isMounted) {
          setIsScopeLoading(false);
        }
      }
    };

    loadScope();

    return () => {
      isMounted = false;
    };
  }, [adminRole, role, user?.email]);

  const visibleAnimals = adminRole
    ? animals
    : animals.filter((animal) => allowedFarmIds.has(Number(animal?.farmId)));

  const handleDelete = async () => {
    if (deletingId) {
      await remove(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header title="Zwierzeta" subtitle="Lista wszystkich zwierzat w gospodarstwie">
        <Button variant="primary" onClick={() => navigate('/animals/add')}>
          Dodaj zwierze
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader text="Pobieranie listy zwierzat..." />}
        {error && <Alert type="error">{error}</Alert>}
        {scopeError && <Alert type="error">{scopeError}</Alert>}
        {scopeError && !adminRole && (
          <Button variant="outline" onClick={() => navigate('/farm-setup')}>
            Dodaj gospodarstwo
          </Button>
        )}

        {!isLoading && !error && !isScopeLoading && visibleAnimals.length === 0 && (
          <EmptyState
            title="Brak zwierzat"
            description="Nie dodano jeszcze zadnego zwierzecia do systemu. Kliknij przycisk powyzej, aby dodac pierwsze zwierze."
          />
        )}

        {!isLoading && !error && !isScopeLoading && visibleAnimals.length > 0 && (
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
                {visibleAnimals.map((animal) => (
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
