import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useZwierzeStore from '../../stores/useZwierzeStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert } from '../../components/common/Common';
import styles from './SzczegolyZwierzecia.module.css';

/* SzczegolyZwierzecia — widok prezentujacy pelne dane wybranego zwierzecia.
   ID zwierzecia pochodzi z parametru URL (useParams).
   Strona demonstrje uzycie parametrow URL zgodnie z wymaganiem routingu. */

function SzczegolyZwierzecia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wybraneZwierze, ladowanie, blad, pobierzPoId, wyczyscWybrane } = useZwierzeStore();

  useEffect(() => {
    pobierzPoId(Number(id));
    return () => wyczyscWybrane();
  }, [id, pobierzPoId, wyczyscWybrane]);

  return (
    <div>
      <Header
        tytul="Szczegoly zwierzecia"
        podtytul={`Identyfikator: ${id}`}
      >
        <Button wariant="outline" onClick={() => navigate('/zwierzeta')}>
          Powrot do listy
        </Button>
        <Link to={`/zwierzeta/${id}/edytuj`}>
          <Button wariant="primary">Edytuj</Button>
        </Link>
      </Header>

      <div className={styles.detailPage}>
        {ladowanie && <Loader tekst="Ladowanie danych zwierzecia..." />}
        {blad && <Alert typ="error">{blad}</Alert>}

        {!ladowanie && !blad && wybraneZwierze && (
          <div className={styles.detailCard}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Numer kolczyka</span>
                <span className={styles.detailValue}>
                  {wybraneZwierze.identyfikatorKolczyka}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Rasa</span>
                <span className={styles.detailValue}>{wybraneZwierze.rasa}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Plec</span>
                <span className={styles.detailValue}>{wybraneZwierze.plec}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Wiek</span>
                <span className={styles.detailValue}>{wybraneZwierze.wiek} lat</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Waga</span>
                <span className={styles.detailValue}>{wybraneZwierze.waga} kg</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data zakupu / urodzenia</span>
                <span className={styles.detailValue}>
                  {wybraneZwierze.dataZakupuUrodzenia}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cena zakupu</span>
                <span className={styles.detailValue}>
                  {wybraneZwierze.cenaZakupu
                    ? `${wybraneZwierze.cenaZakupu} PLN`
                    : 'Nie podano'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data sprzedazy / smierci</span>
                <span className={styles.detailValue}>
                  {wybraneZwierze.dataSprzedazySmierci || 'Brak'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cena sprzedazy</span>
                <span className={styles.detailValue}>
                  {wybraneZwierze.cenaSprzedazy
                    ? `${wybraneZwierze.cenaSprzedazy} PLN`
                    : 'Nie dotyczy'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SzczegolyZwierzecia;
