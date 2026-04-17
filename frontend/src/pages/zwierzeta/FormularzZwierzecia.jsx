import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import useZwierzeStore from '../../stores/useZwierzeStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import styles from './FormularzZwierzecia.module.css';

/* Schemat walidacji — odpowiada polom encji Zwierze z modelu backendowego */
const animalSchema = z.object({
  identyfikatorKolczyka: z
    .string()
    .min(1, 'Ear tag number is required'),
  rasa: z
    .string()
    .min(1, 'Breed is required')
    .max(50, 'Maximum 50 characters'),
  plec: z
    .string()
    .min(1, 'Select sex'),
  wiek: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(0, 'Age cannot be negative'),
  waga: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .min(0, 'Weight cannot be negative'),
  dataZakupuUrodzenia: z
    .string()
    .min(1, 'Date is required'),
  cenaZakupu: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
    .optional()
    .or(z.literal('')),
  idGospodarstwa: z
    .number({ invalid_type_error: 'Select farm' })
    .min(1, 'Farm is required'),
});

/* FormularzZwierzecia — sluzy zarowno do dodawania nowego zwierzecia,
   jak i do edycji istniejacego. Tryb edycji jest wykrywany na podstawie
   obecnosci parametru :id w adresie URL. */

function AnimalFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    wybraneZwierze: selectedAnimal,
    ladowanie: isLoading,
    blad: error,
    dodaj: createAnimal,
    aktualizuj: updateAnimal,
    pobierzPoId: fetchAnimalById,
    wyczyscWybrane: clearSelectedAnimal,
  } = useZwierzeStore();

  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(animalSchema),
  });

  /* W trybie edycji — pobranie danych zwierzecia i wypelnienie formularza */
  useEffect(() => {
    if (isEditMode) {
      fetchAnimalById(Number(id));
    }
    return () => clearSelectedAnimal();
  }, [id, isEditMode, fetchAnimalById, clearSelectedAnimal]);

  useEffect(() => {
    if (isEditMode && selectedAnimal) {
      reset(selectedAnimal);
    }
  }, [selectedAnimal, isEditMode, reset]);

  const onSubmit = async (formData) => {
    let isSuccess;
    if (isEditMode) {
      isSuccess = await updateAnimal(Number(id), formData);
    } else {
      isSuccess = await createAnimal(formData);
    }
    if (isSuccess) {
      navigate('/zwierzeta');
    }
  };

  return (
    <div>
      <Header
        tytul={isEditMode ? 'Edit animal' : 'Add animal'}
        podtytul={
          isEditMode
            ? 'Update selected animal data'
            : 'Fill in the form to add a new animal to records'
        }
      />

      <div className={styles.formPage}>
        {error && <Alert typ="error">{error}</Alert>}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              {/* Numer kolczyka */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="identyfikatorKolczyka">
                  Ear tag number
                </label>
                <input
                  id="identyfikatorKolczyka"
                  type="text"
                  className={`${styles.input} ${errors.identyfikatorKolczyka ? styles.inputError : ''}`}
                  placeholder="np. PL123456789"
                  {...register('identyfikatorKolczyka')}
                />
                {errors.identyfikatorKolczyka && (
                  <span className={styles.errorMessage}>
                    {errors.identyfikatorKolczyka.message}
                  </span>
                )}
              </div>

              {/* Rasa */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="rasa">
                  Breed
                </label>
                <input
                  id="rasa"
                  type="text"
                  className={`${styles.input} ${errors.rasa ? styles.inputError : ''}`}
                  placeholder="np. Holstein-Friesian"
                  {...register('rasa')}
                />
                {errors.rasa && (
                  <span className={styles.errorMessage}>{errors.rasa.message}</span>
                )}
              </div>

              {/* Plec */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="plec">
                  Sex
                </label>
                <select
                  id="plec"
                  className={`${styles.select} ${errors.plec ? styles.inputError : ''}`}
                  {...register('plec')}
                >
                  <option value="">-- Select --</option>
                  <option value="Samiec">Samiec</option>
                  <option value="Samica">Samica</option>
                </select>
                {errors.plec && (
                  <span className={styles.errorMessage}>{errors.plec.message}</span>
                )}
              </div>

              {/* Wiek */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="wiek">
                  Age (years)
                </label>
                <input
                  id="wiek"
                  type="number"
                  className={`${styles.input} ${errors.wiek ? styles.inputError : ''}`}
                  placeholder="0"
                  {...register('wiek', { valueAsNumber: true })}
                />
                {errors.wiek && (
                  <span className={styles.errorMessage}>{errors.wiek.message}</span>
                )}
              </div>

              {/* Waga */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="waga">
                  Weight (kg)
                </label>
                <input
                  id="waga"
                  type="number"
                  step="0.1"
                  className={`${styles.input} ${errors.waga ? styles.inputError : ''}`}
                  placeholder="0.0"
                  {...register('waga', { valueAsNumber: true })}
                />
                {errors.waga && (
                  <span className={styles.errorMessage}>{errors.waga.message}</span>
                )}
              </div>

              {/* Data zakupu/urodzenia */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="dataZakupuUrodzenia">
                  Purchase / birth date
                </label>
                <input
                  id="dataZakupuUrodzenia"
                  type="date"
                  className={`${styles.input} ${errors.dataZakupuUrodzenia ? styles.inputError : ''}`}
                  {...register('dataZakupuUrodzenia')}
                />
                {errors.dataZakupuUrodzenia && (
                  <span className={styles.errorMessage}>
                    {errors.dataZakupuUrodzenia.message}
                  </span>
                )}
              </div>

              {/* Cena zakupu */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="cenaZakupu">
                  Purchase price (PLN)
                </label>
                <input
                  id="cenaZakupu"
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${errors.cenaZakupu ? styles.inputError : ''}`}
                  placeholder="0.00"
                  {...register('cenaZakupu', { valueAsNumber: true })}
                />
                {errors.cenaZakupu && (
                  <span className={styles.errorMessage}>{errors.cenaZakupu.message}</span>
                )}
              </div>

              {/* ID Gospodarstwa */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="idGospodarstwa">
                  Farm
                </label>
                <input
                  id="idGospodarstwa"
                  type="number"
                  className={`${styles.input} ${errors.idGospodarstwa ? styles.inputError : ''}`}
                  placeholder="Farm ID"
                  {...register('idGospodarstwa', { valueAsNumber: true })}
                />
                {errors.idGospodarstwa && (
                  <span className={styles.errorMessage}>{errors.idGospodarstwa.message}</span>
                )}
              </div>

              {/* Przyciski akcji */}
              <div className={styles.formActions}>
                <Button wariant="secondary" onClick={() => navigate('/zwierzeta')}>
                  Cancel
                </Button>
                <Button wariant="primary" type="submit" disabled={isLoading}>
                  {isLoading
                    ? 'Saving...'
                    : isEditMode
                      ? 'Save changes'
                      : 'Add animal'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AnimalFormPage;
