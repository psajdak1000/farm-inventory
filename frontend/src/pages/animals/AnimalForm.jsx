import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import useAnimalStore from '../../stores/useAnimalStore';
import farmService from '../../services/farmService';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import styles from './AnimalForm.module.css';

/* Validation schema — corresponds to the Animal entity fields from the backend model */
const animalSchema = z.object({
  eartagId: z
    .string()
    .min(1, 'Numer kolczyka jest wymagany'),
  breed: z
    .string()
    .min(1, 'Rasa jest wymagana')
    .max(50, 'Maksymalnie 50 znakow'),
  gender: z
    .string()
    .min(1, 'Wybierz plec'),
  age: z
    .number({ invalid_type_error: 'Wiek musi byc liczba' })
    .min(0, 'Wiek nie moze byc ujemny'),
  weight: z
    .number({ invalid_type_error: 'Waga musi byc liczba' })
    .min(0, 'Waga nie moze byc ujemna'),
  purchaseOrBirthDate: z
    .string()
    .min(1, 'Data jest wymagana'),
  purchasePrice: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna')
    .optional()
    .or(z.literal('')),
  farmId: z
    .number({ invalid_type_error: 'Wybierz gospodarstwo' })
    .min(1, 'Gospodarstwo jest wymagane'),
});

/* AnimalForm — used both for adding a new animal and editing an existing one.
   Edit mode is detected based on the presence of the :id parameter in the URL. */

function AnimalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedAnimal, isLoading, error, add, update, fetchById, clearSelected } =
    useAnimalStore();
  const [farms, setFarms] = useState([]);
  const [isFarmsLoading, setIsFarmsLoading] = useState(false);
  const [farmsError, setFarmsError] = useState(null);

  const isEditMode = !!id;
  const parseNumberWithComma = (value) => {
    if (value === undefined || value === null || value === '') {
      return Number.NaN;
    }

    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const parseOptionalNumberWithComma = (value) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const parseFarmId = (value) => {
    if (value === undefined || value === null || value === '') {
      return Number.NaN;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : Number.NaN;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(animalSchema),
  });

  /* In edit mode — fetch animal data and populate the form */
  useEffect(() => {
    let isMounted = true;

    const loadFarms = async () => {
      setIsFarmsLoading(true);
      setFarmsError(null);

      try {
        const farmList = await farmService.fetchAll();
        if (isMounted) {
          setFarms(farmList);
        }
      } catch (loadError) {
        if (isMounted) {
          setFarmsError(loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac gospodarstw.');
        }
      } finally {
        if (isMounted) {
          setIsFarmsLoading(false);
        }
      }
    };

    loadFarms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isEditMode) {
      fetchById(Number(id));
    }
    return () => clearSelected();
  }, [id, isEditMode, fetchById, clearSelected]);

  useEffect(() => {
    if (isEditMode && selectedAnimal) {
      reset(selectedAnimal);
    }
  }, [selectedAnimal, isEditMode, reset]);

  const onSubmit = async (data) => {
    let success;
    if (isEditMode) {
      success = await update(Number(id), data);
    } else {
      success = await add(data);
    }
    if (success) {
      navigate('/animals');
    }
  };

  return (
    <div>
      <Header
        title={isEditMode ? 'Edycja zwierzecia' : 'Dodawanie zwierzecia'}
        subtitle={
          isEditMode
            ? 'Zaktualizuj dane wybranego zwierzecia'
            : 'Wypelnij formularz, aby dodac nowe zwierze do ewidencji'
        }
      />

      <div className={styles.formPage}>
        {error && <Alert type="error">{error}</Alert>}
        {farmsError && <Alert type="error">{farmsError}</Alert>}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              {/* Ear tag number */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="eartagId">
                  Numer kolczyka
                </label>
                <input
                  id="eartagId"
                  type="text"
                  className={`${styles.input} ${errors.eartagId ? styles.inputError : ''}`}
                  placeholder="np. PL123456789"
                  {...register('eartagId')}
                />
                {errors.eartagId && (
                  <span className={styles.errorMessage}>
                    {errors.eartagId.message}
                  </span>
                )}
              </div>

              {/* Breed */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="breed">
                  Rasa
                </label>
                <input
                  id="breed"
                  type="text"
                  className={`${styles.input} ${errors.breed ? styles.inputError : ''}`}
                  placeholder="np. Holstein-Friesian"
                  {...register('breed')}
                />
                {errors.breed && (
                  <span className={styles.errorMessage}>{errors.breed.message}</span>
                )}
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="gender">
                  Plec
                </label>
                <select
                  id="gender"
                  className={`${styles.select} ${errors.gender ? styles.inputError : ''}`}
                  {...register('gender')}
                >
                  <option value="">-- Wybierz --</option>
                  <option value="Samiec">Samiec</option>
                  <option value="Samica">Samica</option>
                </select>
                {errors.gender && (
                  <span className={styles.errorMessage}>{errors.gender.message}</span>
                )}
              </div>

              {/* Age */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="age">
                  Wiek (lata)
                </label>
                <input
                  id="age"
                  type="number"
                  className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
                  placeholder="0"
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && (
                  <span className={styles.errorMessage}>{errors.age.message}</span>
                )}
              </div>

              {/* Weight */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="weight">
                  Waga (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  className={`${styles.input} ${errors.weight ? styles.inputError : ''}`}
                  placeholder="0.0"
                  {...register('weight', { setValueAs: parseNumberWithComma })}
                />
                {errors.weight && (
                  <span className={styles.errorMessage}>{errors.weight.message}</span>
                )}
              </div>

              {/* Purchase / birth date */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="purchaseOrBirthDate">
                  Data zakupu / urodzenia
                </label>
                <input
                  id="purchaseOrBirthDate"
                  type="date"
                  className={`${styles.input} ${errors.purchaseOrBirthDate ? styles.inputError : ''}`}
                  {...register('purchaseOrBirthDate')}
                />
                {errors.purchaseOrBirthDate && (
                  <span className={styles.errorMessage}>
                    {errors.purchaseOrBirthDate.message}
                  </span>
                )}
              </div>

              {/* Purchase price */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="purchasePrice">
                  Cena zakupu (PLN)
                </label>
                <input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${errors.purchasePrice ? styles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('purchasePrice', { setValueAs: parseOptionalNumberWithComma })}
                />
                {errors.purchasePrice && (
                  <span className={styles.errorMessage}>{errors.purchasePrice.message}</span>
                )}
              </div>

              {/* Farm ID */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="farmId">
                  Gospodarstwo
                </label>
                <select
                  id="farmId"
                  className={`${styles.select} ${errors.farmId ? styles.inputError : ''}`}
                  disabled={isFarmsLoading || farms.length === 0}
                  {...register('farmId', { setValueAs: parseFarmId })}
                >
                  <option value="">
                    {isFarmsLoading ? 'Ladowanie gospodarstw...' : '-- Wybierz gospodarstwo --'}
                  </option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} (ID: {farm.id})
                    </option>
                  ))}
                </select>
                {errors.farmId && (
                  <span className={styles.errorMessage}>{errors.farmId.message}</span>
                )}
                {!isFarmsLoading && farms.length === 0 && !farmsError && (
                  <span className={styles.errorMessage}>
                    Brak gospodarstw. Dodaj gospodarstwo w backendzie (np. przez Swagger), aby dodac zwierze.
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => navigate('/animals')}>
                  Anuluj
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading
                    ? 'Zapisywanie...'
                    : isEditMode
                      ? 'Zapisz zmiany'
                      : 'Dodaj zwierze'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AnimalForm;
