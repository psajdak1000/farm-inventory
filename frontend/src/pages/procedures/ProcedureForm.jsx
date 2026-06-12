import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
import useAuthStore from '../../stores/useAuthStore';
import animalService from '../../services/animalService';
import veterinarianService from '../../services/veterinarianService';
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

const procedureSchema = z.object({
  name: z.string().min(1, 'Nazwa zabiegu jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  procedureDate: z
    .string()
    .min(1, 'Data zabiegu jest wymagana')
    .refine(isValidDateInput, 'Podaj poprawna date.'),
  description: z.string().max(300, 'Maksymalnie 300 znakow').optional(),
  cost: z.number({ invalid_type_error: 'Koszt musi byc liczba' }).min(0, 'Koszt nie moze byc ujemny'),
  animalId: z.number({ invalid_type_error: 'Wybierz zwierze' }).min(1, 'ID zwierzecia jest wymagane'),
  veterinarianId: z.number({ invalid_type_error: 'Wybierz lekarza' }).min(1, 'ID lekarza jest wymagane'),
});

function ProcedureForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const {
    selectedProcedure,
    isLoading,
    error,
    add,
    update,
    fetchById,
    clearSelected,
  } = useProcedureStore();
  const [availableAnimals, setAvailableAnimals] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [isRelationsLoading, setIsRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState(null);
  const [scopeError, setScopeError] = useState(null);
  const [newVeterinarian, setNewVeterinarian] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isAddingVeterinarian, setIsAddingVeterinarian] = useState(false);
  const [addVeterinarianError, setAddVeterinarianError] = useState(null);
  const [addVeterinarianSuccess, setAddVeterinarianSuccess] = useState(null);
  const [showQuickAddVeterinarian, setShowQuickAddVeterinarian] = useState(false);

  const adminRole = isAdminRole(role);

  const parseNumberWithComma = (value) => {
    if (value === undefined || value === null || value === '') {
      return Number.NaN;
    }

    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const parseId = (value) => {
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
    resolver: zodResolver(procedureSchema),
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

    const loadRelations = async () => {
      setIsRelationsLoading(true);
      setRelationsError(null);
      setScopeError(null);

      try {
        const [farmList, ownerList, animalList, veterinarianList] = await Promise.all([
          farmService.fetchAll(),
          adminRole ? Promise.resolve([]) : ownerService.fetchAll(),
          animalService.fetchAll(),
          veterinarianService.fetchAll(),
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
        setVeterinarians(veterinarianList);
      } catch (loadError) {
        if (isMounted) {
          setRelationsError(
            loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac danych powiazanych.'
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
  }, [adminRole, role, user?.email]);

  useEffect(() => {
    if (isEditMode) {
      fetchById(Number(id));
    }

    return () => clearSelected();
  }, [clearSelected, fetchById, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && selectedProcedure) {
      reset(selectedProcedure);
    }
  }, [isEditMode, reset, selectedProcedure]);

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
      navigate('/procedures');
    }
  };

  const onAddVeterinarian = async (event) => {
    event.preventDefault();
    setAddVeterinarianError(null);
    setAddVeterinarianSuccess(null);

    const firstName = newVeterinarian.firstName.trim();
    const lastName = newVeterinarian.lastName.trim();
    const phone = newVeterinarian.phone.trim();

    if (!firstName || !lastName) {
      setAddVeterinarianError('Imie i nazwisko lekarza sa wymagane.');
      return;
    }

    if (!/^\d+$/.test(phone)) {
      setAddVeterinarianError('Telefon lekarza musi zawierac tylko cyfry.');
      return;
    }

    try {
      setIsAddingVeterinarian(true);
      const createdVeterinarian = await veterinarianService.add({ firstName, lastName, phone });
      const refreshedVeterinarians = await veterinarianService.fetchAll();
      setVeterinarians(refreshedVeterinarians);
      setValue('veterinarianId', createdVeterinarian.id, { shouldValidate: true });
      setNewVeterinarian({ firstName: '', lastName: '', phone: '' });
      setAddVeterinarianSuccess('Lekarz zostal dodany i wybrany w formularzu zabiegu.');
      setShowQuickAddVeterinarian(false);
    } catch (createError) {
      setAddVeterinarianError(
        createError instanceof Error ? createError.message : 'Nie udalo sie dodac lekarza.'
      );
      setShowQuickAddVeterinarian(true);
    } finally {
      setIsAddingVeterinarian(false);
    }
  };

  const isSingleAnimal = availableAnimals.length === 1;
  const animalSelectDisabled = isRelationsLoading || availableAnimals.length === 0 || isSingleAnimal;
  const noAnimalsMessage =
    scopeError || 'Brak zwierzat przypisanych do dostepnych gospodarstw. Dodaj zwierze, aby kontynuowac.';

  return (
    <div>
      <Header
        title={isEditMode ? 'Edycja zabiegu' : 'Dodawanie zabiegu'}
        subtitle={isEditMode ? 'Zaktualizuj dane zabiegu weterynaryjnego' : 'Zarejestruj nowy zabieg weterynaryjny'}
      />

      <div className={formStyles.formPage}>
        {error && <Alert type="error">{error}</Alert>}
        {relationsError && <Alert type="error">{relationsError}</Alert>}
        {scopeError && <Alert type="error">{scopeError}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="name">
                  Nazwa zabiegu
                </label>
                <input
                  id="name"
                  type="text"
                  className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                  placeholder="np. Szczepienie profilaktyczne"
                  {...register('name')}
                />
                {errors.name && <span className={formStyles.errorMessage}>{errors.name.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="procedureDate">
                  Data zabiegu
                </label>
                <input
                  id="procedureDate"
                  type="date"
                  className={`${formStyles.input} ${errors.procedureDate ? formStyles.inputError : ''}`}
                  {...register('procedureDate')}
                />
                {errors.procedureDate && (
                  <span className={formStyles.errorMessage}>{errors.procedureDate.message}</span>
                )}
              </div>

              <div className={`${formStyles.formGroup} ${formStyles.formGroupFull}`}>
                <label className={formStyles.label} htmlFor="description">
                  Opis
                </label>
                <textarea
                  id="description"
                  className={`${formStyles.textarea} ${errors.description ? formStyles.inputError : ''}`}
                  placeholder="Szczegolowy opis zabiegu (opcjonalnie)"
                  {...register('description')}
                />
                {errors.description && <span className={formStyles.errorMessage}>{errors.description.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="cost">
                  Koszt (PLN)
                </label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${formStyles.input} ${errors.cost ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('cost', { setValueAs: parseNumberWithComma })}
                />
                {errors.cost && <span className={formStyles.errorMessage}>{errors.cost.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="animalId">
                  Zwierze
                </label>
                <select
                  id="animalId"
                  className={`${formStyles.select} ${errors.animalId ? formStyles.inputError : ''}`}
                  disabled={animalSelectDisabled}
                  {...register('animalId', { setValueAs: parseId })}
                >
                  <option value="">
                    {isRelationsLoading
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
                {!isRelationsLoading && availableAnimals.length === 0 && !relationsError && (
                  <span className={formStyles.errorMessage}>{noAnimalsMessage}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="veterinarianId">
                  Lekarz
                </label>
                <select
                  id="veterinarianId"
                  className={`${formStyles.select} ${errors.veterinarianId ? formStyles.inputError : ''}`}
                  disabled={isRelationsLoading || veterinarians.length === 0}
                  {...register('veterinarianId', { setValueAs: parseId })}
                >
                  <option value="">
                    {isRelationsLoading ? 'Ladowanie lekarzy...' : '-- Wybierz lekarza --'}
                  </option>
                  {veterinarians.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.firstName} {vet.lastName}
                    </option>
                  ))}
                </select>
                {errors.veterinarianId && (
                  <span className={formStyles.errorMessage}>{errors.veterinarianId.message}</span>
                )}
                {!isRelationsLoading && veterinarians.length === 0 && !relationsError && (
                  <span className={formStyles.errorMessage}>
                    Brak lekarzy. Dodaj lekarza, aby zarejestrowac zabieg.
                  </span>
                )}
              </div>

              <div className={`${formStyles.formGroup} ${formStyles.formGroupFull}`}>
                <div className={formStyles.formActions}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuickAddVeterinarian((current) => !current);
                      setAddVeterinarianError(null);
                      setAddVeterinarianSuccess(null);
                    }}
                  >
                    {showQuickAddVeterinarian ? 'Ukryj dodawanie lekarza' : 'Dodaj nowego lekarza'}
                  </Button>
                </div>
              </div>

              {showQuickAddVeterinarian && (
                <div className={`${formStyles.formGroup} ${formStyles.formGroupFull}`}>
                  <label className={formStyles.label}>Szybkie dodanie lekarza</label>
                  {addVeterinarianError && <Alert type="error">{addVeterinarianError}</Alert>}
                  {addVeterinarianSuccess && <Alert type="success">{addVeterinarianSuccess}</Alert>}
                  <div className={formStyles.formGrid}>
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.label} htmlFor="newVetFirstName">
                        Imie
                      </label>
                      <input
                        id="newVetFirstName"
                        type="text"
                        className={formStyles.input}
                        value={newVeterinarian.firstName}
                        onChange={(event) =>
                          setNewVeterinarian((current) => ({
                            ...current,
                            firstName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.label} htmlFor="newVetLastName">
                        Nazwisko
                      </label>
                      <input
                        id="newVetLastName"
                        type="text"
                        className={formStyles.input}
                        value={newVeterinarian.lastName}
                        onChange={(event) =>
                          setNewVeterinarian((current) => ({
                            ...current,
                            lastName: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className={formStyles.formGroup}>
                      <label className={formStyles.label} htmlFor="newVetPhone">
                        Telefon
                      </label>
                      <input
                        id="newVetPhone"
                        type="text"
                        className={formStyles.input}
                        value={newVeterinarian.phone}
                        onChange={(event) =>
                          setNewVeterinarian((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className={formStyles.formActions}>
                    <Button variant="outline" onClick={onAddVeterinarian} disabled={isAddingVeterinarian}>
                      {isAddingVeterinarian ? 'Dodawanie...' : 'Dodaj lekarza'}
                    </Button>
                  </div>
                </div>
              )}

              <div className={formStyles.formActions}>
                <Button variant="secondary" onClick={() => navigate('/procedures')}>
                  Anuluj
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Zapisywanie...' : isEditMode ? 'Zapisz zmiany' : 'Dodaj zabieg'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProcedureForm;
