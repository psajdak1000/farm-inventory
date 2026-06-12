import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFeedingStore from '../../stores/useFeedingStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../animals/Animals.module.css';

/* FeedingList — tabular view of all feedings in the system.
   Analogous structure to AnimalList — fetches data from API,
   handles loading/error/empty list states. */

function FeedingList() {
  const { feedings, isLoading, error, fetchAll, remove } = useFeedingStore();
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
        title="Karmienia"
        subtitle="Ewidencja karmien i kosztow pasz"
      >
        <Button variant="primary" onClick={() => navigate('/feeding/add')}>
          Dodaj karmienie
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader text="Pobieranie listy karmien..." />}
        {error && <Alert type="error">{error}</Alert>}

        {!isLoading && !error && feedings.length === 0 && (
          <EmptyState
            title="Brak karmien"
            description="Nie zarejestrowano jeszcze zadnego karmienia. Kliknij przycisk powyzej, aby dodac pierwszy wpis."
          />
        )}

        {!isLoading && !error && feedings.length > 0 && (
          <div className={tableStyles.tableCard}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Nazwa paszy</th>
                  <th>Rodzaj</th>
                  <th>Ilosc</th>
                  <th>Cena (PLN)</th>
                  <th>Data zakupu</th>
                  <th style={{ textAlign: 'right' }}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {feedings.map((feeding) => (
                  <tr key={feeding.feedingId}>
                    <td>{feeding.name}</td>
                    <td>{feeding.type}</td>
                    <td>{feeding.quantity}</td>
                    <td>{feeding.price} PLN</td>
                    <td>{feeding.purchaseDate}</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.editButton}`}
                          onClick={() => navigate(`/feeding/${feeding.feedingId}/edit`)}
                        >
                          Edytuj
                        </button>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setDeletingId(feeding.feedingId)}
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
          title="Usuwanie karmienia"
          content="Czy na pewno chcesz usunac ten wpis karmienia?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default FeedingList;
