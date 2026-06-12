import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
import useAuthStore from '../../stores/useAuthStore';
import animalService from '../../services/animalService';
import farmService from '../../services/farmService';
import ownerService from '../../services/ownerService';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import { isAdminRole, resolveAccessibleFarms } from '../../utils/ownershipScope';
import tableStyles from '../animals/Animals.module.css';

function ProcedureList() {
  const { procedures, isLoading, error, fetchAll, remove } = useProcedureStore();
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [allowedAnimalIds, setAllowedAnimalIds] = useState(new Set());
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
        setAllowedAnimalIds(new Set());
        setScopeError(null);
        return;
      }

      setIsScopeLoading(true);
      setScopeError(null);

      try {
        const [farms, owners, animals] = await Promise.all([
          farmService.fetchAll(),
          ownerService.fetchAll(),
          animalService.fetchAll(),
        ]);

        if (!isMounted) {
          return;
        }

        const scoped = resolveAccessibleFarms({
          farms,
          owners,
          role,
          userEmail: user?.email,
        });

        const allowedFarmIds = new Set(
          scoped.farms
            .map((farm) => Number(farm?.id))
            .filter((farmId) => Number.isInteger(farmId) && farmId > 0)
        );

        const scopedAnimalIds = animals
          .filter((animal) => allowedFarmIds.has(Number(animal?.farmId)))
          .map((animal) => Number(animal?.animalId))
          .filter((animalId) => Number.isInteger(animalId) && animalId > 0);

        setAllowedAnimalIds(new Set(scopedAnimalIds));
        setScopeError(scoped.scopeError);
      } catch (scopeLoadError) {
        if (isMounted) {
          setScopeError(
            scopeLoadError instanceof Error
              ? scopeLoadError.message
              : 'Nie udalo sie pobrac zakresu danych.'
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

  const visibleProcedures = adminRole
    ? procedures
    : procedures.filter((procedure) => allowedAnimalIds.has(Number(procedure?.animalId)));

  const handleDelete = async () => {
    if (deletingId) {
      await remove(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className={tableStyles.pageWrapper}>
      <Header title="Zabiegi weterynaryjne" subtitle="Historia zabiegow wykonanych na zwierzetach">
        <Button variant="primary" onClick={() => navigate('/procedures/add')}>
          Dodaj zabieg
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader text="Pobieranie listy zabiegow..." />}
        {error && <Alert type="error">{error}</Alert>}
        {scopeError && <Alert type="error">{scopeError}</Alert>}
        {scopeError && !adminRole && (
          <Button variant="outline" onClick={() => navigate('/farm-setup')}>
            Dodaj gospodarstwo
          </Button>
        )}

        {!isLoading && !error && !isScopeLoading && visibleProcedures.length === 0 && (
          <EmptyState
            title="Brak zabiegow"
            description="Nie zarejestrowano jeszcze zadnego zabiegu weterynaryjnego."
          />
        )}

        {!isLoading && !error && !isScopeLoading && visibleProcedures.length > 0 && (
          <div className={tableStyles.tableCard}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nazwa zabiegu</th>
                  <th>Data</th>
                  <th>Opis</th>
                  <th>Koszt (PLN)</th>
                  <th style={{ textAlign: 'right' }}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {visibleProcedures.map((procedure) => (
                  <tr key={procedure.procedureId}>
                    <td>{procedure.name}</td>
                    <td>{procedure.procedureDate}</td>
                    <td>{procedure.description}</td>
                    <td>{procedure.cost} PLN</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.viewButton}`}
                          onClick={() => navigate(`/procedures/${procedure.procedureId}`)}
                        >
                          Podglad
                        </button>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                          onClick={() => navigate(`/procedures/${procedure.procedureId}/edit`)}
                        >
                          Edytuj
                        </button>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setDeletingId(procedure.procedureId)}
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
          title="Usuwanie zabiegu"
          content="Czy na pewno chcesz usunac ten zabieg z ewidencji?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default ProcedureList;
