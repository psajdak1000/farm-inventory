import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useKarmienieStore from '../../stores/useKarmienieStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../zwierzeta/Zwierzeta.module.css';

/* ListaKarmien — widok tabelaryczny wszystkich karmien w systemie.
   Struktura analogiczna do ListaZwierzat — pobiera dane z API,
   obsluguje stany ladowania/bledu/pustej listy. */

function FeedingListPage() {
  const {
    karmienia: feedings,
    ladowanie: isLoading,
    blad: error,
    pobierzWszystkie: fetchAllFeedings,
    usun: deleteFeeding,
  } = useKarmienieStore();
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchAllFeedings();
  }, [fetchAllFeedings]);

  const handleDelete = async () => {
    if (pendingDeleteId) {
      await deleteFeeding(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className={tableStyles.pageWrapper}>
      <Header
        tytul="Feedings"
        podtytul="Feeding records and feed costs"
      >
        <Button wariant="primary" onClick={() => navigate('/karmienia/dodaj')}>
          Add feeding
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader tekst="Loading feeding list..." />}
        {error && <Alert typ="error">{error}</Alert>}

        {!isLoading && !error && feedings.length === 0 && (
          <EmptyState
            tytul="No feedings"
            opis="No feeding has been recorded yet. Click the button above to add the first entry."
          />
        )}

        {!isLoading && !error && feedings.length > 0 && (
          <div className={tableStyles.tableCard}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Feed name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price (PLN)</th>
                  <th>Purchase date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedings.map((feeding) => (
                  <tr key={feeding.idKarmienia}>
                    <td>{feeding.nazwa}</td>
                    <td>{feeding.rodzaj}</td>
                    <td>{feeding.ilosc}</td>
                    <td>{feeding.cena} PLN</td>
                    <td>{feeding.dataZakupu}</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setPendingDeleteId(feeding.idKarmienia)}
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

      {pendingDeleteId && (
        <ConfirmModal
          tytul="Delete feeding"
          tresc="Are you sure you want to delete this feeding entry?"
          onPotwierdz={handleDelete}
          onAnuluj={() => setPendingDeleteId(null)}
          ladowanie={isLoading}
        />
      )}
    </div>
  );
}

export default FeedingListPage;
