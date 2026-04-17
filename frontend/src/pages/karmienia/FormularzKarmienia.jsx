import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import useKarmienieStore from '../../stores/useKarmienieStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import formStyles from '../zwierzeta/FormularzZwierzecia.module.css';

/* Schemat walidacji — odpowiada polom encji Karmienie */
const schematKarmienia = z.object({
  nazwa: z.string().min(1, 'Nazwa paszy jest wymagana').max(50, 'Maksymalnie 50 znakow'),
  rodzaj: z.string().min(1, 'Rodzaj jest wymagany'),
  ilosc: z.string().min(1, 'Ilosc jest wymagana'),
  cena: z
    .number({ invalid_type_error: 'Cena musi byc liczba' })
    .min(0, 'Cena nie moze byc ujemna'),
  dataZakupu: z.string().min(1, 'Data zakupu jest wymagana'),
  idZwierzecia: z
    .number({ invalid_type_error: 'Podaj ID zwierzecia' })
    .min(1, 'ID zwierzecia jest wymagane'),
});

/* FormularzKarmienia — formularz rejestracji nowego karmienia. */

function FormularzKarmienia() {
  const navigate = useNavigate();
  const { ladowanie, blad, dodaj } = useKarmienieStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schematKarmienia),
  });

  const onSubmit = async (dane) => {
    const sukces = await dodaj(dane);
    if (sukces) {
      navigate('/karmienia');
    }
  };

  return (
    <div>
      <Header
        tytul="Dodawanie karmienia"
        podtytul="Zarejestruj nowe karmienie w ewidencji"
      />

      <div className={formStyles.formPage}>
        {blad && <Alert typ="error">{blad}</Alert>}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="nazwa">Nazwa paszy</label>
                <input
                  id="nazwa"
                  type="text"
                  className={`${formStyles.input} ${errors.nazwa ? formStyles.inputError : ''}`}
                  placeholder="np. Siano lucernowe"
                  {...register('nazwa')}
                />
                {errors.nazwa && (
                  <span className={formStyles.errorMessage}>{errors.nazwa.message}</span>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="rodzaj">Rodzaj</label>
                <select
                  id="rodzaj"
                  className={`${formStyles.select} ${errors.rodzaj ? formStyles.inputError : ''}`}
                  {...register('rodzaj')}
                >
                  <option value="">-- Wybierz --</option>
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
                <label className={formStyles.label} htmlFor="ilosc">Ilosc</label>
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
                <label className={formStyles.label} htmlFor="cena">Cena (PLN)</label>
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
                <label className={formStyles.label} htmlFor="dataZakupu">Data zakupu</label>
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
                <label className={formStyles.label} htmlFor="idZwierzecia">ID zwierzecia</label>
                <input
                  id="idZwierzecia"
                  type="number"
                  className={`${formStyles.input} ${errors.idZwierzecia ? formStyles.inputError : ''}`}
                  placeholder="ID zwierzecia"
                  {...register('idZwierzecia', { valueAsNumber: true })}
                />
                {errors.idZwierzecia && (
                  <span className={formStyles.errorMessage}>{errors.idZwierzecia.message}</span>
                )}
              </div>

              <div className={formStyles.formActions}>
                <Button wariant="secondary" onClick={() => navigate('/karmienia')}>
                  Anuluj
                </Button>
                <Button wariant="primary" type="submit" disabled={ladowanie}>
                  {ladowanie ? 'Zapisywanie...' : 'Dodaj karmienie'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularzKarmienia;
