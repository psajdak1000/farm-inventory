import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useProcedureStore from '../../stores/useProcedureStore';
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
    .number({ invalid_type_error: 'Podaj ID zwierzecia' })
    .min(1, 'ID zwierzecia jest wymagane'),
  veterinarianId: z
    .number({ invalid_type_error: 'Podaj ID lekarza' })
    .min(1, 'ID lekarza jest wymagane'),
});

/* ProcedureForm — form for registering a new veterinary procedure. */

function ProcedureForm() {
  const navigate = useNavigate();
  const { isLoading, error, add } = useProcedureStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(procedureSchema),
  });

  const onSubmit = async (data) => {
    const success = await add(data);
    if (success) {
      navigate('/procedures');
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
                  {...register('cost', { valueAsNumber: true })}
                />
                {errors.cost && (
                  <span className={formStyles.errorMessage}>{errors.cost.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="animalId">ID zwierzecia</label>
                <input
                  id="animalId"
                  type="number"
                  className={`${formStyles.input} ${errors.animalId ? formStyles.inputError : ''}`}
                  {...register('animalId', { valueAsNumber: true })}
                />
                {errors.animalId && (
                  <span className={formStyles.errorMessage}>{errors.animalId.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="veterinarianId">ID lekarza</label>
                <input
                  id="veterinarianId"
                  type="number"
                  className={`${formStyles.input} ${errors.veterinarianId ? formStyles.inputError : ''}`}
                  {...register('veterinarianId', { valueAsNumber: true })}
                />
                {errors.veterinarianId && (
                  <span className={formStyles.errorMessage}>{errors.veterinarianId.message}</span>
                )}
              </div>

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