import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useZabiegStore from '../../stores/useZabiegStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../zwierzeta/FormularzZwierzecia.module.css';

/* Schemat walidacji — odpowiada polom encji Zabieg */
const schematZabiegu = z.object({
  nazwa: z.string().min(1, 'Nazwa zabiegu jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  dataZabiegu: z.string().min(1, 'Data zabiegu jest wymagana'),
  opis: z.string().max(300, 'Maksymalnie 300 znakow').optional(),
  koszt: z
    .number({ invalid_type_error: 'Koszt musi byc liczba' })
    .min(0, 'Koszt nie moze byc ujemny'),
  idZwierzecia: z
    .number({ invalid_type_error: 'Podaj ID zwierzecia' })
    .min(1, 'ID zwierzecia jest wymagane'),
  idLekarza: z
    .number({ invalid_type_error: 'Podaj ID lekarza' })
    .min(1, 'ID lekarza jest wymagane'),
});

/* FormularzZabiegu — formularz rejestracji nowego zabiegu weterynaryjnego. */

function FormularzZabiegu() {
  const navigate = useNavigate();
  const { ladowanie, blad, dodaj } = useZabiegStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schematZabiegu),
  });

  const onSubmit = async (dane) => {
    const sukces = await dodaj(dane);
    if (sukces) {
      navigate('/zabiegi');
    }
  };

  return (
    <div>
      <Header
        tytul="Dodawanie zabiegu"
        podtytul="Zarejestruj nowy zabieg weterynaryjny"
      />

      <div className={formStyles.formPage}>
        {blad && <Alert typ="error">{blad}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="nazwa">Nazwa zabiegu</label>
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
                <label className={formStyles.label} htmlFor="dataZabiegu">Data zabiegu</label>
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
                <label className={formStyles.label} htmlFor="opis">Opis</label>
                <textarea
                  id="opis"
                  className={`${formStyles.textarea} ${errors.opis ? formStyles.inputError : ''}`}
                  placeholder="Szczegolowy opis zabiegu (opcjonalnie)"
                  {...register('opis')}
                />
                {errors.opis && (
                  <span className={formStyles.errorMessage}>{errors.opis.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="koszt">Koszt (PLN)</label>
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
                <label className={formStyles.label} htmlFor="idZwierzecia">ID zwierzecia</label>
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
                <label className={formStyles.label} htmlFor="idLekarza">ID lekarza</label>
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
                  Anuluj
                </Button>
                <Button wariant="primary" type="submit" disabled={ladowanie}>
                  {ladowanie ? 'Zapisywanie...' : 'Dodaj zabieg'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularzZabiegu;
