import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFeedingStore from '../../stores/useFeedingStore';
import animalService from '../../services/animalService';
import farmService from '../../services/farmService';
import Header from '../../components/layout/Header';
import { Alert, Button, Loader } from '../../components/common/Common';
import styles from '../animals/AnimalDetails.module.css';

function FeedingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedFeeding, isLoading, error, fetchById, clearSelected } = useFeedingStore();
  const [animal, setAnimal] = useState(null);
  const [farm, setFarm] = useState(null);
  const [isRelationsLoading, setIsRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState(null);

  useEffect(() => {
    fetchById(Number(id));
    return () => clearSelected();
  }, [clearSelected, fetchById, id]);

  useEffect(() => {
    let isMounted = true;

    const loadRelations = async () => {
      if (!selectedFeeding) {
        setAnimal(null);
        setFarm(null);
        setRelationsError(null);
        return;
      }

      setIsRelationsLoading(true);
      setRelationsError(null);

      try {
        const [animalData, farmList] = await Promise.all([
          animalService.fetchById(selectedFeeding.animalId),
          farmService.fetchAll(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnimal(animalData);
        const matchedFarm = farmList.find(
          (farmItem) => Number(farmItem?.id) === Number(animalData?.farmId)
        );
        setFarm(matchedFarm ?? null);
      } catch (relationLoadError) {
        if (isMounted) {
          setRelationsError(
            relationLoadError instanceof Error
              ? relationLoadError.message
              : 'Nie udalo sie pobrac danych powiazanych z karmieniem.'
          );
        }
      } finally {
        if (isMounted) {
          setIsRelationsLoading(false);
        }
      }
    };

    loadRelations();

    return () => {
      isMounted = false;
    };
  }, [selectedFeeding]);

  return (
    <div>
      <Header title="Szczegoly karmienia" subtitle={`Identyfikator: ${id}`}>
        <Button variant="outline" onClick={() => navigate('/feeding')}>
          Wroc do listy
        </Button>
        <Link to={`/feeding/${id}/edit`}>
          <Button variant="primary">Edytuj</Button>
        </Link>
      </Header>

      <div className={styles.detailPage}>
        {isLoading && <Loader text="Ladowanie danych karmienia..." />}
        {error && <Alert type="error">{error}</Alert>}
        {relationsError && <Alert type="warning">{relationsError}</Alert>}

        {!isLoading && !error && selectedFeeding && (
          <div className={styles.detailCard}>
            {isRelationsLoading && <Loader text="Ladowanie danych zwierzecia i gospodarstwa..." />}

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nazwa paszy</span>
                <span className={styles.detailValue}>{selectedFeeding.name || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Rodzaj</span>
                <span className={styles.detailValue}>{selectedFeeding.type || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Ilosc</span>
                <span className={styles.detailValue}>{selectedFeeding.quantity || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cena</span>
                <span className={styles.detailValue}>{selectedFeeding.price} PLN</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data</span>
                <span className={styles.detailValue}>{selectedFeeding.purchaseDate || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Id zwierzecia</span>
                <span className={styles.detailValue}>{selectedFeeding.animalId}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Numer kolczyka</span>
                <span className={styles.detailValue}>{animal?.eartagId || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Rasa</span>
                <span className={styles.detailValue}>{animal?.breed || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Gospodarstwo</span>
                <span className={styles.detailValue}>{farm?.name || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Adres gospodarstwa</span>
                <span className={styles.detailValue}>{farm?.address || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Typ gospodarstwa</span>
                <span className={styles.detailValue}>{farm?.type || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Id gospodarstwa</span>
                <span className={styles.detailValue}>{farm?.id ?? '-'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FeedingDetails;
