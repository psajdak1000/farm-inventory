import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useFeedingStore from '../../stores/useFeedingStore';
import animalService from '../../services/animalService';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../animals/AnimalForm.module.css';

/* Validation schema — corresponds to the Feeding entity fields */
const feedingSchema = z.object({
  name: z.string().min(1, 'Nazwa paszy jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  type: z.string().min(1, 'Rodzaj jest wymagany').max(20, 'Maksymalnie 20 znakow'),
  quantity: z
    .number({ invalid_type_error: 'Ilosc musi byc liczba' })
    .min(0, 'Ilosc nie moze byc ujemna'),
  price: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna'),
  purchaseDate: z.string().min(1, 'Data zakupu jest wymagana'),
  animalId: z
    .number({ invalid_type_error: 'Wybierz zwierze' })
    .min(1, 'ID zwierzecia jest wymagane'),
});

/* FeedingForm — form for registering a new feeding. */

function FeedingForm() {
  const navigate = useNavigate();
  const { isLoading, error, add } = useFeedingStore();
  const [animals, setAnimals] = useState([]);
  const [isAnimalsLoading, setIsAnimalsLoading] = useState(false);
  const [animalsError, setAnimalsError] = useState(null);

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(feedingSchema),
  });

  useEffect(() => {
    let isMounted = true;

    const loadAnimals = async () => {
      setIsAnimalsLoading(true);
      setAnimalsError(null);

      try {
        const animalList = await animalService.fetchAll();
        if (isMounted) {
          setAnimals(animalList);
        }
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
  }, []);

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
        {animalsError && <Alert type="error">{animalsError}</Alert>}

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
                  type="number"
                  step="0.01"
                  className={`${formStyles.input} ${errors.quantity ? formStyles.inputError : ''}`}
                  placeholder="0.0"
                  {...register('quantity', { setValueAs: parseNumberWithComma })}
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
                  {...register('price', { setValueAs: parseNumberWithComma })}
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
                <label className={formStyles.label} htmlFor="animalId">Zwierze</label>
                <select
                  id="animalId"
                  className={`${formStyles.select} ${errors.animalId ? formStyles.inputError : ''}`}
                  disabled={isAnimalsLoading || animals.length === 0}
                  {...register('animalId', { setValueAs: parseAnimalId })}
                >
                  <option value="">
                    {isAnimalsLoading ? 'Ladowanie zwierzat...' : '-- Wybierz zwierze --'}
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
                {!isAnimalsLoading && animals.length === 0 && !animalsError && (
                  <span className={formStyles.errorMessage}>
                    Brak zwierzat. Dodaj zwierze, aby zarejestrowac karmienie.
                  </span>
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
