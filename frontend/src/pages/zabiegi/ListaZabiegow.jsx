import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useZabiegStore from '../../stores/useZabiegStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../zwierzeta/Zwierzeta.module.css';

/* ListaZabiegow — widok tabelaryczny zabiegow weterynaryjnych.
   Dostepny zarowno dla wlasciciela jak i lekarza (zgodnie z diagramem UML). */

function TreatmentListPage() {
  const {
    zabiegi: treatments,
    ladowanie: isLoading,
    blad: error,
    pobierzWszystkie: fetchAllTreatments,
    usun: deleteTreatment,
  } = useZabiegStore();
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    fetchAllTreatments();
  }, [fetchAllTreatments]);

  const handleDelete = async () => {
    if (pendingDeleteId) {
      await deleteTreatment(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className={tableStyles.pageWrapper}>
      <Header
        tytul="Veterinary treatments"
        podtytul="History of treatments performed on animals"
      >
        <Button wariant="primary" onClick={() => navigate('/zabiegi/dodaj')}>
          Add treatment
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {isLoading && <Loader tekst="Loading treatment list..." />}
        {error && <Alert typ="error">{error}</Alert>}

        {!isLoading && !error && treatments.length === 0 && (
          <EmptyState
            tytul="No treatments"
            opis="No veterinary treatment has been recorded yet."
          />
        )}

        {!isLoading && !error && treatments.length > 0 && (
          <div className={tableStyles.tableCard}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Treatment name</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Cost (PLN)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => (
                  <tr key={treatment.idZabiegu}>
                    <td>{treatment.nazwa}</td>
                    <td>{treatment.dataZabiegu}</td>
                    <td>{treatment.opis}</td>
                    <td>{treatment.koszt} PLN</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setPendingDeleteId(treatment.idZabiegu)}
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
          tytul="Delete treatment"
          tresc="Are you sure you want to delete this treatment from records?"
          onPotwierdz={handleDelete}
          onAnuluj={() => setPendingDeleteId(null)}
          ladowanie={isLoading}
        />
      )}
    </div>
  );
}

export default TreatmentListPage;
