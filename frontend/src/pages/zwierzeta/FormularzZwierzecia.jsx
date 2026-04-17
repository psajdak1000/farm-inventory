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
const schematZwierzecia = z.object({
  identyfikatorKolczyka: z
    .string()
    .min(1, 'Numer kolczyka jest wymagany'),
  rasa: z
    .string()
    .min(1, 'Rasa jest wymagana')
    .max(50, 'Maksymalnie 50 znakow'),
  plec: z
    .string()
    .min(1, 'Wybierz plec'),
  wiek: z
    .number({ invalid_type_error: 'Wiek musi byc liczba' })
    .min(0, 'Wiek nie moze byc ujemny'),
  waga: z
    .number({ invalid_type_error: 'Waga musi byc liczba' })
    .min(0, 'Waga nie moze byc ujemna'),
  dataZakupuUrodzenia: z
    .string()
    .min(1, 'Data jest wymagana'),
  cenaZakupu: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna')
    .optional()
    .or(z.literal('')),
  idGospodarstwa: z
    .number({ invalid_type_error: 'Wybierz gospodarstwo' })
    .min(1, 'Gospodarstwo jest wymagane'),
});

/* FormularzZwierzecia — sluzy zarowno do dodawania nowego zwierzecia,
   jak i do edycji istniejacego. Tryb edycji jest wykrywany na podstawie
   obecnosci parametru :id w adresie URL. */

function FormularzZwierzecia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wybraneZwierze, ladowanie, blad, dodaj, aktualizuj, pobierzPoId, wyczyscWybrane } =
    useZwierzeStore();

  const trybEdycji = !!id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schematZwierzecia),
  });

  /* W trybie edycji — pobranie danych zwierzecia i wypelnienie formularza */
  useEffect(() => {
    if (trybEdycji) {
      pobierzPoId(Number(id));
    }
    return () => wyczyscWybrane();
  }, [id, trybEdycji, pobierzPoId, wyczyscWybrane]);

  useEffect(() => {
    if (trybEdycji && wybraneZwierze) {
      reset(wybraneZwierze);
    }
  }, [wybraneZwierze, trybEdycji, reset]);

  const onSubmit = async (dane) => {
    let sukces;
    if (trybEdycji) {
      sukces = await aktualizuj(Number(id), dane);
    } else {
      sukces = await dodaj(dane);
    }
    if (sukces) {
      navigate('/zwierzeta');
    }
  };

  return (
    <div>
      <Header
        tytul={trybEdycji ? 'Edycja zwierzecia' : 'Dodawanie zwierzecia'}
        podtytul={
          trybEdycji
            ? 'Zaktualizuj dane wybranego zwierzecia'
            : 'Wypelnij formularz, aby dodac nowe zwierze do ewidencji'
        }
      />

      <div className={styles.formPage}>
        {blad && <Alert typ="error">{blad}</Alert>}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              {/* Numer kolczyka */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="identyfikatorKolczyka">
                  Numer kolczyka
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
                  Rasa
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
                  Plec
                </label>
                <select
                  id="plec"
                  className={`${styles.select} ${errors.plec ? styles.inputError : ''}`}
                  {...register('plec')}
                >
                  <option value="">-- Wybierz --</option>
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
                  Wiek (lata)
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
                  Waga (kg)
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
                  Data zakupu / urodzenia
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
                  Cena zakupu (PLN)
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
                  Gospodarstwo
                </label>
                <input
                  id="idGospodarstwa"
                  type="number"
                  className={`${styles.input} ${errors.idGospodarstwa ? styles.inputError : ''}`}
                  placeholder="ID gospodarstwa"
                  {...register('idGospodarstwa', { valueAsNumber: true })}
                />
                {errors.idGospodarstwa && (
                  <span className={styles.errorMessage}>{errors.idGospodarstwa.message}</span>
                )}
              </div>

              {/* Przyciski akcji */}
              <div className={styles.formActions}>
                <Button wariant="secondary" onClick={() => navigate('/zwierzeta')}>
                  Anuluj
                </Button>
                <Button wariant="primary" type="submit" disabled={ladowanie}>
                  {ladowanie
                    ? 'Zapisywanie...'
                    : trybEdycji
                      ? 'Zapisz zmiany'
                      : 'Dodaj zwierze'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularzZwierzecia;
