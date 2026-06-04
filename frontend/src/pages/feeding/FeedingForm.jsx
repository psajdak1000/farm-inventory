import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useFeedingStore from '../../stores/useFeedingStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../animals/AnimalForm.module.css';

/* Validation schema — corresponds to the Feeding entity fields */
const feedingSchema = z.object({
  name: z.string().min(1, 'Nazwa paszy jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  type: z.string().min(1, 'Rodzaj jest wymagany'),
  quantity: z.string().min(1, 'Ilosc jest wymagana'),
  price: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna'),
  purchaseDate: z.string().min(1, 'Data zakupu jest wymagana'),
  animalId: z
    .number({ invalid_type_error: 'Podaj ID zwierzecia' })
    .min(1, 'ID zwierzecia jest wymagane'),
});

/* FeedingForm — form for registering a new feeding. */

function FeedingForm() {
  const navigate = useNavigate();
  const { isLoading, error, add } = useFeedingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedingSchema),
  });

  const onSubmit = async (data) => {
    const success = await add(data);
    if (success) {
      navigate('/feeding');
    }
  };

  return (
    <div>
      <Header
        title="Dodawanie karmienia"
        subtitle="Zarejestruj nowe karmienie w ewidencji"
      />

      <div className={formStyles.formPage}>
        {error && <Alert type="error">{error}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="name">Nazwa paszy</label>
                <input
                  id="name"
                  type="text"
                  className={`${formStyles.input} ${errors.name ? formStyles.inputError : ''}`}
                  placeholder="np. Siano lucernowe"
                  {...register('name')}
                />
                {errors.name && (
                  <span className={formStyles.errorMessage}>{errors.name.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="type">Rodzaj</label>
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
                {errors.type && (
                  <span className={formStyles.errorMessage}>{errors.type.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="quantity">Ilosc</label>
                <input
                  id="quantity"
                  type="text"
                  className={`${formStyles.input} ${errors.quantity ? formStyles.inputError : ''}`}
                  placeholder="np. 50 kg"
                  {...register('quantity')}
                />
                {errors.quantity && (
                  <span className={formStyles.errorMessage}>{errors.quantity.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="price">Cena (PLN)</label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  className={`${formStyles.input} ${errors.price ? formStyles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <span className={formStyles.errorMessage}>{errors.price.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="purchaseDate">Data zakupu</label>
                <input
                  id="purchaseDate"
                  type="date"
                  className={`${formStyles.input} ${errors.purchaseDate ? formStyles.inputError : ''}`}
                  {...register('purchaseDate')}
                />
                {errors.purchaseDate && (
                  <span className={formStyles.errorMessage}>{errors.purchaseDate.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="animalId">ID zwierzecia</label>
                <input
                  id="animalId"
                  type="number"
                  className={`${formStyles.input} ${errors.animalId ? formStyles.inputError : ''}`}
                  placeholder="ID zwierzecia"
                  {...register('animalId', { valueAsNumber: true })}
                />
                {errors.animalId && (
                  <span className={formStyles.errorMessage}>{errors.animalId.message}</span>
                )}
              </div>

              <div className={formStyles.formActions}>
                <Button variant="secondary" onClick={() => navigate('/feeding')}>
                  Anuluj
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Zapisywanie...' : 'Dodaj karmienie'}
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