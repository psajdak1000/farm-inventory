import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useZabiegStore from '../../stores/useZabiegStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../zwierzeta/FormularzZwierzecia.module.css';

/* Schemat walidacji — odpowiada polom encji Zabieg */
const treatmentSchema = z.object({
  nazwa: z.string().min(1, 'Treatment name is required').max(50, 'Maximum 50 characters'),
  dataZabiegu: z.string().min(1, 'Treatment date is required'),
  opis: z.string().max(300, 'Maximum 300 characters').optional(),
  koszt: z
    .number({ invalid_type_error: 'Cost must be a number' })
    .min(0, 'Cost cannot be negative'),
  idZwierzecia: z
    .number({ invalid_type_error: 'Enter animal ID' })
    .min(1, 'Animal ID is required'),
  idLekarza: z
    .number({ invalid_type_error: 'Enter doctor ID' })
    .min(1, 'Doctor ID is required'),
});

/* FormularzZabiegu — formularz rejestracji nowego zabiegu weterynaryjnego. */

function TreatmentFormPage() {
  const navigate = useNavigate();
  const { ladowanie: isLoading, blad: error, dodaj: createTreatment } = useZabiegStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(treatmentSchema),
  });

  const onSubmit = async (formData) => {
    const isSuccess = await createTreatment(formData);
    if (isSuccess) {
      navigate('/zabiegi');
    }
  };

  return (
    <div>
      <Header
        tytul="Add treatment"
        podtytul="Register a new veterinary treatment"
      />

      <div className={formStyles.formPage}>
        {error && <Alert typ="error">{error}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="nazwa">Treatment name</label>
                <input
                  id="nazwa"
                  type="text"
                  className={`${formStyles.input} ${errors.nazwa ? formStyles.inputError : ''}`}
                  placeholder="np. Szczepienie profilaktyczne"
                  {...register('nazwa')}
                />
                {errors.nazwa && (
                  <span className={formStyles.errorMessage}>{errors.nazwa.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="dataZabiegu">Treatment date</label>
                <input
                  id="dataZabiegu"
                  type="date"
                  className={`${formStyles.input} ${errors.dataZabiegu ? formStyles.inputError : ''}`}
                  {...register('dataZabiegu')}
                />
                {errors.dataZabiegu && (
                  <span className={formStyles.errorMessage}>{errors.dataZabiegu.message}</span>
                )}
              </div>

              <div className={`${formStyles.formGroup} ${formStyles.formGroupFull}`}>
                <label className={formStyles.label} htmlFor="opis">Description</label>
                <textarea
                  id="opis"
                  className={`${formStyles.textarea} ${errors.opis ? formStyles.inputError : ''}`}
                  placeholder="Detailed treatment description (optional)"
                  {...register('opis')}
                />
                {errors.opis && (
                  <span className={formStyles.errorMessage}>{errors.opis.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="koszt">Cost (PLN)</label>
                <input
                  id="koszt"
                  type="number"
                  step="0.01"
                  className={`${formStyles.input} ${errors.koszt ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('koszt', { valueAsNumber: true })}
                />
                {errors.koszt && (
                  <span className={formStyles.errorMessage}>{errors.koszt.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="idZwierzecia">Animal ID</label>
                <input
                  id="idZwierzecia"
                  type="number"
                  className={`${formStyles.input} ${errors.idZwierzecia ? formStyles.inputError : ''}`}
                  {...register('idZwierzecia', { valueAsNumber: true })}
                />
                {errors.idZwierzecia && (
                  <span className={formStyles.errorMessage}>{errors.idZwierzecia.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="idLekarza">Doctor ID</label>
                <input
                  id="idLekarza"
                  type="number"
                  className={`${formStyles.input} ${errors.idLekarza ? formStyles.inputError : ''}`}
                  {...register('idLekarza', { valueAsNumber: true })}
                />
                {errors.idLekarza && (
                  <span className={formStyles.errorMessage}>{errors.idLekarza.message}</span>
                )}
              </div>

              <div className={formStyles.formActions}>
                <Button wariant="secondary" onClick={() => navigate('/zabiegi')}>
                  Cancel
                </Button>
                <Button wariant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Add treatment'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TreatmentFormPage;
