import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useFeedingStore from '../../stores/useFeedingStore';
import useAuthStore from '../../stores/useAuthStore';
import animalService from '../../services/animalService';
import farmService from '../../services/farmService';
import ownerService from '../../services/ownerService';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import {
  isAdminRole,
  resolveAccessibleFarms,
} from '../../utils/ownershipScope';
import formStyles from '../animals/AnimalForm.module.css';

const isValidDateInput = (value) => {
  const normalized = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return false;
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
};

const feedingSchema = z.object({
  name: z.string().min(1, 'Nazwa paszy jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  type: z.string().min(1, 'Rodzaj jest wymagany').max(20, 'Maksymalnie 20 znakow'),
  quantity: z.number({ invalid_type_error: 'Ilosc musi byc liczba' }).min(0, 'Ilosc nie moze byc ujemna'),
  price: z.number({ invalid_type_error: 'Cena musi byc liczba' }).min(0, 'Cena nie moze byc ujemna'),
  purchaseDate: z
    .string()
    .min(1, 'Data zakupu jest wymagana')
    .refine(isValidDateInput, 'Podaj poprawna date.'),
  animalId: z.number({ invalid_type_error: 'Wybierz zwierze' }).min(1, 'ID zwierzecia jest wymagane'),
});

function FeedingForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const {
    selectedFeeding,
    isLoading,
    error,
    add,
    update,
    fetchById,
    clearSelected,
  } = useFeedingStore();
  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [isAnimalsLoading, setIsAnimalsLoading] = useState(false);
  const [animalsError, setAnimalsError] = useState(null);
  const [scopeError, setScopeError] = useState(null);

  const adminRole = isAdminRole(role);

  const parseNumberWithComma = (value) => {
    if (value === undefined || value === null || value === '') {
      return Number.NaN;
    }

    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const parseAnimalId = (value) => {
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
    resolver: zodResolver(feedingSchema),
  });

  const availableAnimalIds = useMemo(
    () =>
      new Set(
        availableAnimals
          .map((animal) => Number(animal?.animalId))
          .filter((animalId) => Number.isInteger(animalId) && animalId > 0)
      ),
    [availableAnimals]
  );

  useEffect(() => {
    let isMounted = true;

    const loadAnimals = async () => {
      setIsAnimalsLoading(true);
      setAnimalsError(null);
      setScopeError(null);

      try {
        const [farmList, ownerList, animalList] = await Promise.all([
          farmService.fetchAll(),
          adminRole ? Promise.resolve([]) : ownerService.fetchAll(),
          animalService.fetchAll(),
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

        if (scoped.scopeError) {
          setScopeError(scoped.scopeError);
        }

        const allowedFarmIds = new Set(scoped.farms.map((farm) => Number(farm?.id)));
        const scopedAnimals = adminRole
          ? animalList
          : animalList.filter((animal) => allowedFarmIds.has(Number(animal?.farmId)));

        setAvailableAnimals(scopedAnimals);
      } catch (loadError) {
        if (isMounted) {
          setAnimalsError(loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac listy zwierzat.');
        }
      } finally {
        if (isMounted) {
          setIsAnimalsLoading(false);
        }
      }
    };

    loadAnimals();

    return () => {
      isMounted = false;
    };
  }, [adminRole, role, user?.email]);

  useEffect(() => {
    if (isEditMode) {
      fetchById(Number(id));
    }

    return () => clearSelected();
  }, [clearSelected, fetchById, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedFeeding) {
      reset(selectedFeeding);
    }
  }, [isEditMode, reset, selectedFeeding]);

  useEffect(() => {
    if (availableAnimals.length === 1) {
      setValue('animalId', Number(availableAnimals[0].animalId), { shouldValidate: true });
      clearErrors('animalId');
    }
  }, [availableAnimals, clearErrors, setValue]);

  const onSubmit = async (data) => {
    if (availableAnimals.length === 0) {
      const message =
        scopeError || 'Brak zwierzat przypisanych do dostepnych gospodarstw. Dodaj zwierze, aby kontynuowac.';
      setError('animalId', { type: 'manual', message });
      return;
    }

    if (!availableAnimalIds.has(Number(data.animalId))) {
      setError('animalId', {
        type: 'manual',
        message: 'Mozesz wybrac tylko zwierze przypisane do gospodarstwa zalogowanego uzytkownika.',
      });
      return;
    }

    let success;
    if (isEditMode) {
      success = await update(Number(id), data);
    } else {
      success = await add(data);
    }

    if (success) {
      navigate('/feeding');
    }
  };

  const isSingleAnimal = availableAnimals.length === 1;
  const animalSelectDisabled = isAnimalsLoading || availableAnimals.length === 0 || isSingleAnimal;
  const noAnimalsMessage =
    scopeError || 'Brak zwierzat przypisanych do dostepnych gospodarstw. Dodaj zwierze, aby kontynuowac.';
  const showFarmSetupAction = Boolean(scopeError) && !isAnimalsLoading;

  const handleAddFarm = () => {
    const returnTo = `${location.pathname}${location.search}`;
    navigate(`/farm-setup?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div>
      <Header
        title={isEditMode ? 'Edycja karmienia' : 'Dodawanie karmienia'}
        subtitle={
          isEditMode ? 'Zaktualizuj dane wpisu karmienia' : 'Zarejestruj nowe karmienie w ewidencji'
        }
      />

      <div className={formStyles.formPage}>
        {error && <Alert type="error">{error}</Alert>}
        {animalsError && <Alert type="error">{animalsError}</Alert>}
        {scopeError && <Alert type="error">{scopeError}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="name">
                  Nazwa paszy
                </label>
                <input
                  id="name"
                  type="text"
                  className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                  placeholder="np. Siano lucernowe"
                  {...register('name')}
                />
                {errors.name && <span className={formStyles.errorMessage}>{errors.name.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="type">
                  Rodzaj
                </label>
                <select
                  id="type"
                  className={`${formStyles.select} ${errors.type ? formStyles.inputError : ''}`}
                  {...register('type')}
                >
                  <option value="">-- Wybierz --</option>
                  <option value="Sucha">Sucha</option>
                  <option value="Mokra">Mokra</option>
                  <option value="Pastwiskowa">Pastwiskowa</option>
                  <option value="Koncentrat">Koncentrat</option>
                </select>
                {errors.type && <span className={formStyles.errorMessage}>{errors.type.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="quantity">
                  Ilosc
                </label>
                <input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${formStyles.input} ${errors.quantity ? formStyles.inputError : ''}`}
                  placeholder="0.0"
                  {...register('quantity', { setValueAs: parseNumberWithComma })}
                />
                {errors.quantity && <span className={formStyles.errorMessage}>{errors.quantity.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="price">
                  Cena (PLN)
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${formStyles.input} ${errors.price ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('price', { setValueAs: parseNumberWithComma })}
                />
                {errors.price && <span className={formStyles.errorMessage}>{errors.price.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="purchaseDate">
                  Data zakupu
                </label>
                <input
                  id="purchaseDate"
                  type="date"
                  className={`${formStyles.input} ${errors.purchaseDate ? formStyles.inputError : ''}`}
                  {...register('purchaseDate')}
                />
                {errors.purchaseDate && <span className={formStyles.errorMessage}>{errors.purchaseDate.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="animalId">
                  Zwierze
                </label>
                <select
                  id="animalId"
                  className={`${formStyles.select} ${errors.animalId ? formStyles.inputError : ''}`}
                  disabled={animalSelectDisabled}
                  {...register('animalId', { setValueAs: parseAnimalId })}
                >
                  <option value="">
                    {isAnimalsLoading
                      ? 'Ladowanie zwierzat...'
                      : isSingleAnimal
                        ? 'Zwierze przypisane automatycznie'
                        : '-- Wybierz zwierze --'}
                  </option>
                  {availableAnimals.map((animal) => (
                    <option key={animal.animalId} value={animal.animalId}>
                      {animal.eartagId} - {animal.breed}
                    </option>
                  ))}
                </select>
                {errors.animalId && <span className={formStyles.errorMessage}>{errors.animalId.message}</span>}
                {!isAnimalsLoading && availableAnimals.length === 0 && !animalsError && (
                  <span className={formStyles.errorMessage}>{noAnimalsMessage}</span>
                )}
                {showFarmSetupAction && (
                  <div className={formStyles.formActions}>
                    <Button variant="outline" onClick={handleAddFarm}>
                      Dodaj gospodarstwo
                    </Button>
                  </div>
                )}
              </div>

              <div className={formStyles.formActions}>
                <Button variant="secondary" onClick={() => navigate('/feeding')}>
                  Anuluj
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Dodaj karmienie'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FeedingForm;
