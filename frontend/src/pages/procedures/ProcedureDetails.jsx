import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
import animalService from '../../services/animalService';
import farmService from '../../services/farmService';
import veterinarianService from '../../services/veterinarianService';
import Header from '../../components/layout/Header';
import { Alert, Button, Loader } from '../../components/common/Common';
import styles from '../animals/AnimalDetails.module.css';

function ProcedureDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedProcedure, isLoading, error, fetchById, clearSelected } = useProcedureStore();
  const [animal, setAnimal] = useState(null);
  const [farm, setFarm] = useState(null);
  const [veterinarian, setVeterinarian] = useState(null);
  const [isRelationsLoading, setIsRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState(null);

  useEffect(() => {
    fetchById(Number(id));
    return () => clearSelected();
  }, [clearSelected, fetchById, id]);

  useEffect(() => {
    let isMounted = true;

    const loadRelations = async () => {
      if (!selectedProcedure) {
        setAnimal(null);
        setFarm(null);
        setVeterinarian(null);
        setRelationsError(null);
        return;
      }

      setIsRelationsLoading(true);
      setRelationsError(null);

      try {
        const [animalData, farmList, veterinarianList] = await Promise.all([
          animalService.fetchById(selectedProcedure.animalId),
          farmService.fetchAll(),
          veterinarianService.fetchAll(),
        ]);

        if (!isMounted) {
          return;
        }

        setAnimal(animalData);
        const matchedFarm = farmList.find(
          (farmItem) => Number(farmItem?.id) === Number(animalData?.farmId)
        );
        setFarm(matchedFarm ?? null);

        const matchedVeterinarian = veterinarianList.find(
          (vetItem) => Number(vetItem?.id) === Number(selectedProcedure.veterinarianId)
        );
        setVeterinarian(matchedVeterinarian ?? null);
      } catch (relationLoadError) {
        if (isMounted) {
          setRelationsError(
            relationLoadError instanceof Error
              ? relationLoadError.message
              : 'Nie udalo sie pobrac danych powiazanych z zabiegiem.'
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
  }, [selectedProcedure]);

  return (
    <div>
      <Header title="Szczegoly zabiegu" subtitle={`Identyfikator: ${id}`}>
        <Button variant="outline" onClick={() => navigate('/procedures')}>
          Wroc do listy
        </Button>
        <Link to={`/procedures/${id}/edit`}>
          <Button variant="primary">Edytuj</Button>
        </Link>
      </Header>

      <div className={styles.detailPage}>
        {isLoading && <Loader text="Ladowanie danych zabiegu..." />}
        {error && <Alert type="error">{error}</Alert>}
        {relationsError && <Alert type="warning">{relationsError}</Alert>}

        {!isLoading && !error && selectedProcedure && (
          <div className={styles.detailCard}>
            {isRelationsLoading && <Loader text="Ladowanie danych zwierzecia, lekarza i gospodarstwa..." />}

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Nazwa zabiegu</span>
                <span className={styles.detailValue}>{selectedProcedure.name || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data</span>
                <span className={styles.detailValue}>{selectedProcedure.procedureDate || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Koszt</span>
                <span className={styles.detailValue}>{selectedProcedure.cost} PLN</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Opis</span>
                <span className={styles.detailValue}>{selectedProcedure.description || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Id zwierzecia</span>
                <span className={styles.detailValue}>{selectedProcedure.animalId}</span>
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
                <span className={styles.detailLabel}>Lekarz</span>
                <span className={styles.detailValue}>
                  {veterinarian
                    ? `${veterinarian.firstName || ''} ${veterinarian.lastName || ''}`.trim()
                    : '-'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Telefon lekarza</span>
                <span className={styles.detailValue}>{veterinarian?.phone || '-'}</span>
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

export default ProcedureDetails;
