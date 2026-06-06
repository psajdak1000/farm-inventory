import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
import animalService from '../../services/animalService';
import veterinarianService from '../../services/veterinarianService';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../animals/AnimalForm.module.css';

/* Validation schema — corresponds to the Procedure entity fields */
const procedureSchema = z.object({
  name: z.string().min(1, 'Nazwa zabiegu jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  procedureDate: z.string().min(1, 'Data zabiegu jest wymagana'),
  description: z.string().max(300, 'Maksymalnie 300 znakow').optional(),
  cost: z
    .number({ invalid_type_error: 'Koszt musi byc liczba' })
    .min(0, 'Koszt nie moze byc ujemny'),
  animalId: z
    .number({ invalid_type_error: 'Wybierz zwierze' })
    .min(1, 'ID zwierzecia jest wymagane'),
  veterinarianId: z
    .number({ invalid_type_error: 'Wybierz lekarza' })
    .min(1, 'ID lekarza jest wymagane'),
});

/* ProcedureForm — form for registering a new veterinary procedure. */

function ProcedureForm() {
  const navigate = useNavigate();
  const { isLoading, error, add } = useProcedureStore();
  const [animals, setAnimals] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [isRelationsLoading, setIsRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState(null);
  const [newVeterinarian, setNewVeterinarian] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isAddingVeterinarian, setIsAddingVeterinarian] = useState(false);
  const [addVeterinarianError, setAddVeterinarianError] = useState(null);
  const [addVeterinarianSuccess, setAddVeterinarianSuccess] = useState(null);
  const [showQuickAddVeterinarian, setShowQuickAddVeterinarian] = useState(false);

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
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(procedureSchema),
  });

  useEffect(() => {
    let isMounted = true;

    const loadRelations = async () => {
      setIsRelationsLoading(true);
      setRelationsError(null);

      try {
        const [animalList, veterinarianList] = await Promise.all([
          animalService.fetchAll(),
          veterinarianService.fetchAll(),
        ]);

        if (isMounted) {
          setAnimals(animalList);
          setVeterinarians(veterinarianList);
        }
      } catch (loadError) {
        if (isMounted) {
          setRelationsError(loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac danych powiazanych.');
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
  }, []);

  const onSubmit = async (data) => {
    const success = await add(data);
    if (success) {
      navigate('/procedures');
    }
  };

  const onAddVeterinarian = async (event) => {
    event.preventDefault();
    setAddVeterinarianError(null);
    setAddVeterinarianSuccess(null);

    try {
      setIsAddingVeterinarian(true);
      const createdVeterinarian = await veterinarianService.add(newVeterinarian);
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

  return (
    <div>
      <Header
        title="Dodawanie zabiegu"
        subtitle="Zarejestruj nowy zabieg weterynaryjny"
      />

      <div className={formStyles.formPage}>
        {error && <Alert type="error">{error}</Alert>}
        {relationsError && <Alert type="error">{relationsError}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="name">Nazwa zabiegu</label>
                <input
                  id="name"
                  type="text"
                  className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                  placeholder="np. Szczepienie profilaktyczne"
                  {...register('name')}
                />
                {errors.name && (
                  <span className={formStyles.errorMessage}>{errors.name.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="procedureDate">Data zabiegu</label>
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
                <label className={formStyles.label} htmlFor="description">Opis</label>
                <textarea
                  id="description"
                  className={`${formStyles.textarea} ${errors.description ? formStyles.inputError : ''}`}
                  placeholder="Szczegolowy opis zabiegu (opcjonalnie)"
                  {...register('description')}
                />
                {errors.description && (
                  <span className={formStyles.errorMessage}>{errors.description.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="cost">Koszt (PLN)</label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  className={`${formStyles.input} ${errors.cost ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('cost', { setValueAs: parseNumberWithComma })}
                />
                {errors.cost && (
                  <span className={formStyles.errorMessage}>{errors.cost.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="animalId">Zwierze</label>
                <select
                  id="animalId"
                  className={`${formStyles.select} ${errors.animalId ? formStyles.inputError : ''}`}
                  disabled={isRelationsLoading || animals.length === 0}
                  {...register('animalId', { setValueAs: parseId })}
                >
                  <option value="">
                    {isRelationsLoading ? 'Ladowanie zwierzat...' : '-- Wybierz zwierze --'}
                  </option>
                  {animals.map((animal) => (
                    <option key={animal.animalId} value={animal.animalId}>
                      {animal.eartagId} - {animal.breed} (ID: {animal.animalId})
                    </option>
                  ))}
                </select>
                {errors.animalId && (
                  <span className={formStyles.errorMessage}>{errors.animalId.message}</span>
                )}
                {!isRelationsLoading && animals.length === 0 && !relationsError && (
                  <span className={formStyles.errorMessage}>
                    Brak zwierzat. Dodaj zwierze, aby zarejestrowac zabieg.
                  </span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="veterinarianId">Lekarz</label>
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
                      {vet.firstName} {vet.lastName} (ID: {vet.id})
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
                      <label className={formStyles.label} htmlFor="newVetFirstName">Imie</label>
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
                      <label className={formStyles.label} htmlFor="newVetLastName">Nazwisko</label>
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
                      <label className={formStyles.label} htmlFor="newVetPhone">Telefon</label>
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
                    <Button
                      variant="outline"
                      onClick={onAddVeterinarian}
                      disabled={isAddingVeterinarian}
                    >
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
                  {isLoading ? 'Zapisywanie...' : 'Dodaj zabieg'}
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
