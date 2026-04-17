import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useKarmienieStore from '../../stores/useKarmienieStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert, EmptyState, ConfirmModal } from '../../components/common/Common';
import tableStyles from '../zwierzeta/Zwierzeta.module.css';

/* ListaKarmien — widok tabelaryczny wszystkich karmien w systemie.
   Struktura analogiczna do ListaZwierzat — pobiera dane z API,
   obsluguje stany ladowania/bledu/pustej listy. */

function ListaKarmien() {
  const { karmienia, ladowanie, blad, pobierzWszystkie, usun } = useKarmienieStore();
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
        tytul="Karmienia"
        podtytul="Ewidencja karmien i kosztow pasz"
      >
        <Button wariant="primary" onClick={() => navigate('/karmienia/dodaj')}>
          Dodaj karmienie
        </Button>
      </Header>

      <main style={{ padding: 'var(--spacing-2xl)' }}>
        {ladowanie && <Loader tekst="Pobieranie listy karmien..." />}
        {blad && <Alert typ="error">{blad}</Alert>}

        {!ladowanie && !blad && karmienia.length === 0 && (
          <EmptyState
            tytul="Brak karmien"
            opis="Nie zarejestrowano jeszcze zadnego karmienia. Kliknij przycisk powyzej, aby dodac pierwszy wpis."
          />
        )}

        {!ladowanie && !blad && karmienia.length > 0 && (
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
                {karmienia.map((karmienie) => (
                  <tr key={karmienie.idKarmienia}>
                    <td>{karmienie.nazwa}</td>
                    <td>{karmienie.rodzaj}</td>
                    <td>{karmienie.ilosc}</td>
                    <td>{karmienie.cena} PLN</td>
                    <td>{karmienie.dataZakupu}</td>
                    <td>
                      <div className={tableStyles.actionsCell}>
                        <button
                          className={`${tableStyles.actionButton} ${tableStyles.deleteButton}`}
                          onClick={() => setUsuwaneId(karmienie.idKarmienia)}
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
          tytul="Usuwanie karmienia"
          tresc="Czy na pewno chcesz usunac ten wpis karmienia?"
          onPotwierdz={handleUsun}
          onAnuluj={() => setUsuwaneId(null)}
          ladowanie={ladowanie}
        />
      )}
    </div>
  );
}

export default ListaKarmien;
