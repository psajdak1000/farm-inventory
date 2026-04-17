import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useKarmienieStore from '../../stores/useKarmienieStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../zwierzeta/FormularzZwierzecia.module.css';

/* Schemat walidacji — odpowiada polom encji Karmienie */
const feedingSchema = z.object({
  nazwa: z.string().min(1, 'Feed name is required').max(50, 'Maximum 50 characters'),
  rodzaj: z.string().min(1, 'Type is required'),
  ilosc: z.string().min(1, 'Quantity is required'),
  cena: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  dataZakupu: z.string().min(1, 'Purchase date is required'),
  idZwierzecia: z
    .number({ invalid_type_error: 'Enter animal ID' })
    .min(1, 'Animal ID is required'),
});

/* FormularzKarmienia — formularz rejestracji nowego karmienia. */

function FeedingFormPage() {
  const navigate = useNavigate();
  const { ladowanie: isLoading, blad: error, dodaj: createFeeding } = useKarmienieStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedingSchema),
  });

  const onSubmit = async (formData) => {
    const isSuccess = await createFeeding(formData);
    if (isSuccess) {
      navigate('/karmienia');
    }
  };

  return (
    <div>
      <Header
        tytul="Add feeding"
        podtytul="Register a new feeding in records"
      />

      <div className={formStyles.formPage}>
        {error && <Alert typ="error">{error}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="nazwa">Feed name</label>
                <input
                  id="nazwa"
                  type="text"
                  className={`${formStyles.input} ${errors.nazwa ? formStyles.inputError : ''}`}
                  placeholder="e.g. Alfalfa hay"
                  {...register('nazwa')}
                />
                {errors.nazwa && (
                  <span className={formStyles.errorMessage}>{errors.nazwa.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="rodzaj">Type</label>
                <select
                  id="rodzaj"
                  className={`${formStyles.select} ${errors.rodzaj ? formStyles.inputError : ''}`}
                  {...register('rodzaj')}
                >
                  <option value="">-- Select --</option>
                  <option value="Sucha">Sucha</option>
                  <option value="Mokra">Mokra</option>
                  <option value="Pastwiskowa">Pastwiskowa</option>
                  <option value="Koncentrat">Koncentrat</option>
                </select>
                {errors.rodzaj && (
                  <span className={formStyles.errorMessage}>{errors.rodzaj.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="ilosc">Quantity</label>
                <input
                  id="ilosc"
                  type="text"
                  className={`${formStyles.input} ${errors.ilosc ? formStyles.inputError : ''}`}
                  placeholder="np. 50 kg"
                  {...register('ilosc')}
                />
                {errors.ilosc && (
                  <span className={formStyles.errorMessage}>{errors.ilosc.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="cena">Price (PLN)</label>
                <input
                  id="cena"
                  type="number"
                  step="0.01"
                  className={`${formStyles.input} ${errors.cena ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('cena', { valueAsNumber: true })}
                />
                {errors.cena && (
                  <span className={formStyles.errorMessage}>{errors.cena.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="dataZakupu">Purchase date</label>
                <input
                  id="dataZakupu"
                  type="date"
                  className={`${formStyles.input} ${errors.dataZakupu ? formStyles.inputError : ''}`}
                  {...register('dataZakupu')}
                />
                {errors.dataZakupu && (
                  <span className={formStyles.errorMessage}>{errors.dataZakupu.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="idZwierzecia">Animal ID</label>
                <input
                  id="idZwierzecia"
                  type="number"
                  className={`${formStyles.input} ${errors.idZwierzecia ? formStyles.inputError : ''}`}
                  placeholder="Animal ID"
                  {...register('idZwierzecia', { valueAsNumber: true })}
                />
                {errors.idZwierzecia && (
                  <span className={formStyles.errorMessage}>{errors.idZwierzecia.message}</span>
                )}
              </div>

              <div className={formStyles.formActions}>
                <Button wariant="secondary" onClick={() => navigate('/karmienia')}>
                  Cancel
                </Button>
                <Button wariant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Add feeding'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FeedingFormPage;
