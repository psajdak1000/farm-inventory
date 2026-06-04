import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAnimalStore from '../../stores/useAnimalStore';
import Header from '../../components/layout/Header';
import { Button, Loader, Alert } from '../../components/common/Common';
import styles from './AnimalDetails.module.css';

/* AnimalDetails — view displaying the full data of a selected animal.
   The animal ID comes from the URL parameter (useParams).
   The page demonstrates use of URL parameters per the routing requirement. */

function AnimalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedAnimal, isLoading, error, fetchById, clearSelected } = useAnimalStore();

  useEffect(() => {
    fetchById(Number(id));
    return () => clearSelected();
  }, [id, fetchById, clearSelected]);

  return (
    <div>
      <Header
        title="Szczegoly zwierzecia"
        subtitle={`Identyfikator: ${id}`}
      >
        <Button variant="outline" onClick={() => navigate('/animals')}>
          Powrot do listy
        </Button>
        <Link to={`/animals/${id}/edit`}>
          <Button variant="primary">Edytuj</Button>
        </Link>
      </Header>

      <div className={styles.detailPage}>
        {isLoading && <Loader text="Ladowanie danych zwierzecia..." />}
        {error && <Alert type="error">{error}</Alert>}

        {!isLoading && !error && selectedAnimal && (
          <div className={styles.detailCard}>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Numer kolczyka</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.eartagId}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Rasa</span>
                <span className={styles.detailValue}>{selectedAnimal.breed}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Plec</span>
                <span className={styles.detailValue}>{selectedAnimal.gender}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Wiek</span>
                <span className={styles.detailValue}>{selectedAnimal.age} lat</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Waga</span>
                <span className={styles.detailValue}>{selectedAnimal.weight} kg</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data zakupu / urodzenia</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.purchaseOrBirthDate}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cena zakupu</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.purchasePrice
                    ? `${selectedAnimal.purchasePrice} PLN`
                    : 'Nie podano'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data sprzedazy / smierci</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.saleOrDeathDate || 'Brak'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cena sprzedazy</span>
                <span className={styles.detailValue}>
                  {selectedAnimal.salePrice
                    ? `${selectedAnimal.salePrice} PLN`
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

export default AnimalDetails;