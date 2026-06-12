import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useAnimalStore from '../../stores/useAnimalStore';
import useAuthStore from '../../stores/useAuthStore';
import farmService from '../../services/farmService';
import ownerService from '../../services/ownerService';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import {
  isAdminRole,
  NO_ASSIGNED_FARM_MESSAGE,
  resolveAccessibleFarms,
} from '../../utils/ownershipScope';
import styles from './AnimalForm.module.css';

const isValidDateInput = (value) => {
  const normalized = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return false;
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};

const animalSchema = z.object({
  eartagId: z.string().min(1, 'Numer kolczyka jest wymagany'),
  breed: z.string().min(1, 'Rasa jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  gender: z.string().min(1, 'Wybierz plec'),
  age: z.number({ invalid_type_error: 'Wiek musi byc liczba' }).min(0, 'Wiek nie moze byc ujemny'),
  weight: z.number({ invalid_type_error: 'Waga musi byc liczba' }).min(0, 'Waga nie moze byc ujemna'),
  purchaseOrBirthDate: z
    .string()
    .min(1, 'Data jest wymagana')
    .refine(isValidDateInput, 'Podaj poprawna date.'),
  purchasePrice: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna')
    .optional(),
  farmId: z
    .number({ invalid_type_error: 'Wybierz gospodarstwo' })
    .min(1, 'Gospodarstwo jest wymagane'),
});

function AnimalForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const { selectedAnimal, isLoading, error, add, update, fetchById, clearSelected } = useAnimalStore();
  const [availableFarms, setAvailableFarms] = useState([]);
  const [isFarmsLoading, setIsFarmsLoading] = useState(false);
  const [farmsError, setFarmsError] = useState(null);
  const [farmScopeError, setFarmScopeError] = useState(null);

  const isEditMode = !!id;
  const adminRole = isAdminRole(role);

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
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(animalSchema),
  });

  const availableFarmIds = useMemo(
    () =>
      new Set(
        availableFarms
          .map((farm) => Number(farm?.id))
          .filter((farmId) => Number.isInteger(farmId) && farmId > 0)
      ),
    [availableFarms]
  );

  useEffect(() => {
    let isMounted = true;

    const loadFarms = async () => {
      setIsFarmsLoading(true);
      setFarmsError(null);
      setFarmScopeError(null);

      try {
        const [farmList, ownerList] = await Promise.all([
          farmService.fetchAll(),
          adminRole ? Promise.resolve([]) : ownerService.fetchAll(),
        ]);

        if (!isMounted) {
          return;
        }

        const scoped = resolveAccessibleFarms({
          farms: farmList,
          owners: ownerList,
          role,
          userEmail: user?.email,
        });

        setAvailableFarms(scoped.farms);
        setFarmScopeError(scoped.scopeError);

        if (scoped.scopeError) {
          setError('farmId', { type: 'manual', message: NO_ASSIGNED_FARM_MESSAGE });
        } else {
          clearErrors('farmId');
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
  }, [adminRole, clearErrors, role, setError, user?.email]);

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

  useEffect(() => {
    if (availableFarms.length === 1) {
      setValue('farmId', Number(availableFarms[0].id), { shouldValidate: true });
      clearErrors('farmId');
    }
  }, [availableFarms, clearErrors, setValue]);

  const onSubmit = async (data) => {
    if (!adminRole) {
      if (availableFarms.length === 0) {
        setError('farmId', { type: 'manual', message: NO_ASSIGNED_FARM_MESSAGE });
        return;
      }

      if (!availableFarmIds.has(Number(data.farmId))) {
        setError('farmId', {
          type: 'manual',
          message: 'Mozesz wybrac tylko gospodarstwo przypisane do zalogowanego uzytkownika.',
        });
        return;
      }
    }

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

  const isSingleFarm = availableFarms.length === 1;
  const farmSelectDisabled = isFarmsLoading || availableFarms.length === 0 || isSingleFarm;
  const noFarmMessage = adminRole
    ? 'Brak gospodarstw. Najpierw dodaj gospodarstwo.'
    : NO_ASSIGNED_FARM_MESSAGE;
  const hasNoAvailableFarms = !isFarmsLoading && availableFarms.length === 0 && !farmsError;

  const handleAddFarm = () => {
    const returnTo = `${location.pathname}${location.search}`;
    navigate(`/farm-setup?returnTo=${encodeURIComponent(returnTo)}`);
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
        {farmScopeError && <Alert type="error">{farmScopeError}</Alert>}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="eartagId">
                  Numer kolczyka
                </label>
                <input
                  id="eartagId"
                  type="text"
                  className={`${styles.input} ${errors.eartagId ? styles.inputError : ''}`}
                  placeholder="np. 123456789"
                  {...register('eartagId')}
                />
                {errors.eartagId && <span className={styles.errorMessage}>{errors.eartagId.message}</span>}
              </div>

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
                {errors.breed && <span className={styles.errorMessage}>{errors.breed.message}</span>}
              </div>

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
                {errors.gender && <span className={styles.errorMessage}>{errors.gender.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="age">
                  Wiek (lata)
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
                  placeholder="0"
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && <span className={styles.errorMessage}>{errors.age.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="weight">
                  Waga (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  className={`${styles.input} ${errors.weight ? styles.inputError : ''}`}
                  placeholder="0.0"
                  {...register('weight', { setValueAs: parseNumberWithComma })}
                />
                {errors.weight && <span className={styles.errorMessage}>{errors.weight.message}</span>}
              </div>

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
                  <span className={styles.errorMessage}>{errors.purchaseOrBirthDate.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="purchasePrice">
                  Cena zakupu (PLN)
                </label>
                <input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${styles.input} ${errors.purchasePrice ? styles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('purchasePrice', { setValueAs: parseOptionalNumberWithComma })}
                />
                {errors.purchasePrice && <span className={styles.errorMessage}>{errors.purchasePrice.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="farmId">
                  Gospodarstwo
                </label>
                <select
                  id="farmId"
                  className={`${styles.select} ${errors.farmId ? styles.inputError : ''}`}
                  disabled={farmSelectDisabled}
                  {...register('farmId', { setValueAs: parseFarmId })}
                >
                  <option value="">
                    {isFarmsLoading
                      ? 'Ladowanie gospodarstw...'
                      : isSingleFarm
                        ? 'Gospodarstwo przypisane automatycznie'
                        : '-- Wybierz gospodarstwo --'}
                  </option>
                  {availableFarms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
                {errors.farmId && <span className={styles.errorMessage}>{errors.farmId.message}</span>}
                {hasNoAvailableFarms && <span className={styles.errorMessage}>{noFarmMessage}</span>}
                {hasNoAvailableFarms && (
                  <div className={styles.formActions}>
                    <Button variant="outline" onClick={handleAddFarm}>
                      Dodaj gospodarstwo
                    </Button>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <Button variant="secondary" onClick={() => navigate('/animals')}>
                  Anuluj
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Dodaj zwierze'}
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
