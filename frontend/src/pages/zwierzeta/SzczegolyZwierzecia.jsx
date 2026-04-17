import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useZwierzeStore from '../../stores/useZwierzeStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert } from '../../components/common/Common';
import styles from './SzczegolyZwierzecia.module.css';

/* SzczegolyZwierzecia — widok prezentujacy pelne dane wybranego zwierzecia.
   ID zwierzecia pochodzi z parametru URL (useParams).
   Strona demonstrje uzycie parametrow URL zgodnie z wymaganiem routingu. */

function AnimalDetailsPage() {
  const { id: animalId } = useParams();
  const navigate = useNavigate();
  const {
    wybraneZwierze: selectedAnimal,
    ladowanie: isLoading,
    blad: error,
    pobierzPoId: fetchAnimalById,
    wyczyscWybrane: clearSelectedAnimal,
  } = useZwierzeStore();

  useEffect(() => {
    fetchAnimalById(Number(animalId));
    return () => clearSelectedAnimal();
  }, [animalId, fetchAnimalById, clearSelectedAnimal]);

  return (
    <div>
      <Header
        tytul="Animal details"
        podtytul={`ID: ${animalId}`}
      >
        <Button wariant="outline" onClick={() => navigate('/zwierzeta')}>
          Back to list
        </Button>
        <Link to={`/zwierzeta/${animalId}/edytuj`}>
          <Button wariant="primary">Edit</Button>
        </Link>
      </Header>

      <div className={styles.detailPage}>
        {isLoading && <Loader tekst="Loading animal data..." />}
        {error && <Alert typ="error">{error}</Alert>}

        {!isLoading && !error && selectedAnimal && (
          <div className={styles.detailCard}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ear tag number</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.identyfikatorKolczyka}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Breed</span>
                <span className={styles.detailValue}>{selectedAnimal.rasa}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sex</span>
                <span className={styles.detailValue}>{selectedAnimal.plec}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Age</span>
                <span className={styles.detailValue}>{selectedAnimal.wiek} years</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Weight</span>
                <span className={styles.detailValue}>{selectedAnimal.waga} kg</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Purchase / birth date</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.dataZakupuUrodzenia}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Purchase price</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.cenaZakupu
                    ? `${selectedAnimal.cenaZakupu} PLN`
                    : 'Not provided'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sale / death date</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.dataSprzedazySmierci || 'None'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Sale price</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.cenaSprzedazy
                    ? `${selectedAnimal.cenaSprzedazy} PLN`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimalDetailsPage;
