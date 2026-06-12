import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../animals/Animals.module.css';

/* ProcedureList — tabular view of veterinary procedures.
   Available to both the owner and the vet (per the UML diagram). */

function ProcedureList() {
  const { procedures, isLoading, error, fetchAll, remove } = useProcedureStore();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleDelete = async () => {
    if (deletingId) {
      await remove(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className={tableStyles.pageWrapper}>
      <Header
        title="Zabiegi weterynaryjne"
        subtitle="Historia zabiegow wykonanych na zwierzetach"
      >
        <Button variant="primary" onClick={() => navigate('/procedures/add')}>
          Dodaj zabieg
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader text="Pobieranie listy zabiegow..." />}
        {error && <Alert type="error">{error}</Alert>}

        {!isLoading && !error && procedures.length === 0 && (
          <EmptyState
            title="Brak zabiegow"
            description="Nie zarejestrowano jeszcze zadnego zabiegu weterynaryjnego."
          />
        )}

        {!isLoading && !error && procedures.length > 0 && (
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
                {procedures.map((procedure) => (
                  <tr key={procedure.procedureId}>
                    <td>{procedure.name}</td>
                    <td>{procedure.procedureDate}</td>
                    <td>{procedure.description}</td>
                    <td>{procedure.cost} PLN</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
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
