import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useZabiegStore from '../../stores/useZabiegStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../zwierzeta/Zwierzeta.module.css';

/* ListaZabiegow — widok tabelaryczny zabiegow weterynaryjnych.
   Dostepny zarowno dla wlasciciela jak i lekarza (zgodnie z diagramem UML). */

function ListaZabiegow() {
  const { zabiegi, ladowanie, blad, pobierzWszystkie, usun } = useZabiegStore();
  const navigate = useNavigate();
  const [usuwaneId, setUsuwaneId] = useState(null);

  useEffect(() => {
    pobierzWszystkie();
  }, [pobierzWszystkie]);

  const handleUsun = async () => {
    if (usuwaneId) {
      await usun(usuwaneId);
      setUsuwaneId(null);
    }
  };

  return (
    <div className={tableStyles.pageWrapper}>
      <Header
        tytul="Zabiegi weterynaryjne"
        podtytul="Historia zabiegow wykonanych na zwierzetach"
      >
        <Button wariant="primary" onClick={() => navigate('/zabiegi/dodaj')}>
          Dodaj zabieg
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {ladowanie && <Loader tekst="Pobieranie listy zabiegow..." />}
        {blad && <Alert typ="error">{blad}</Alert>}

        {!ladowanie && !blad && zabiegi.length === 0 && (
          <EmptyState
            tytul="Brak zabiegow"
            opis="Nie zarejestrowano jeszcze zadnego zabiegu weterynaryjnego."
          />
        )}

        {!ladowanie && !blad && zabiegi.length > 0 && (
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
                {zabiegi.map((zabieg) => (
                  <tr key={zabieg.idZabiegu}>
                    <td>{zabieg.nazwa}</td>
                    <td>{zabieg.dataZabiegu}</td>
                    <td>{zabieg.opis}</td>
                    <td>{zabieg.koszt} PLN</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setUsuwaneId(zabieg.idZabiegu)}
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

      {usuwaneId && (
        <ConfirmModal
          tytul="Usuwanie zabiegu"
          tresc="Czy na pewno chcesz usunac ten zabieg z ewidencji?"
          onPotwierdz={handleUsun}
          onAnuluj={() => setUsuwaneId(null)}
          ladowanie={ladowanie}
        />
      )}
    </div>
  );
}

export default ListaZabiegow;
