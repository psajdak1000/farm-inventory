import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import farmService from '../../services/farmService';
import ownerService from '../../services/ownerService';
import Header from '../../components/layout/Header';
import { Alert, Button } from '../../components/common/Common';
import formStyles from '../animals/AnimalForm.module.css';

const farmSetupSchema = z.object({
  ownerEmail: z.string().email('Nieprawidlowy email wlasciciela.'),
  ownerFirstName: z.string().min(1, 'Imie wlasciciela jest wymagane.').max(50, 'Maksymalnie 50 znakow.'),
  ownerLastName: z.string().min(1, 'Nazwisko wlasciciela jest wymagane.').max(50, 'Maksymalnie 50 znakow.'),
  ownerPhone: z.string().regex(/^\d{9}$/, 'Telefon wlasciciela musi miec dokladnie 9 cyfr.'),
  farmName: z.string().min(1, 'Nazwa gospodarstwa jest wymagana.').max(100, 'Maksymalnie 100 znakow.'),
  farmAddress: z.string().min(1, 'Adres gospodarstwa jest wymagany.').max(100, 'Maksymalnie 100 znakow.'),
  farmType: z.string().min(1, 'Typ gospodarstwa jest wymagany.').max(50, 'Maksymalnie 50 znakow.'),
  farmArea: z
    .number({ invalid_type_error: 'Powierzchnia musi byc liczba.' })
    .min(0, 'Powierzchnia nie moze byc ujemna.'),
});

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

function FarmSetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [existingOwner, setExistingOwner] = useState(null);
  const [existingFarms, setExistingFarms] = useState([]);
  const [createdFarm, setCreatedFarm] = useState(null);

  const returnToRaw = searchParams.get('returnTo');
  const returnTo = useMemo(() => {
    if (typeof returnToRaw === 'string' && returnToRaw.startsWith('/')) {
      return returnToRaw;
    }
    return '/animals/add';
  }, [returnToRaw]);

  const currentUserEmail = useMemo(() => String(user?.email ?? '').trim(), [user?.email]);

  const parseNumberWithComma = (value) => {
    if (value === undefined || value === null || value === '') {
      return Number.NaN;
    }

    const normalized = String(value).trim().replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  };

  const {
    register,
    handleSubmit,
    setValue,
    setError: setFormError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(farmSetupSchema),
    defaultValues: {
      ownerEmail: '',
      ownerFirstName: '',
      ownerLastName: '',
      ownerPhone: '',
      farmName: '',
      farmAddress: '',
      farmType: 'Mieszane',
      farmArea: 0,
    },
  });

  const goBackToForm = () => {
    navigate(returnTo, { replace: true, state: { farmSetupCompleted: true } });
  };

  useEffect(() => {
    if (!currentUserEmail) {
      return;
    }

    setValue('ownerEmail', currentUserEmail, { shouldValidate: true });
    setValue('ownerFirstName', String(user?.firstName ?? '').trim(), { shouldValidate: true });
    setValue('ownerLastName', String(user?.lastName ?? '').trim(), { shouldValidate: true });
  }, [currentUserEmail, setValue, user?.firstName, user?.lastName]);

  useEffect(() => {
    let isMounted = true;

    const loadOwnershipContext = async () => {
      if (!currentUserEmail) {
        return;
      }

      setIsLoadingContext(true);
      setError(null);

      try {
        const [owners, farms] = await Promise.all([ownerService.fetchAll(), farmService.fetchAll()]);
        if (!isMounted) {
          return;
        }

        const matchedOwner = owners.find((owner) => normalizeEmail(owner.email) === normalizeEmail(currentUserEmail));
        setExistingOwner(matchedOwner ?? null);

        if (matchedOwner) {
          const ownerFarms = farms.filter((farm) => Number(farm.ownerId) === Number(matchedOwner.id));
          setExistingFarms(ownerFarms);
          setValue('ownerFirstName', String(matchedOwner.firstName ?? ''), { shouldValidate: true });
          setValue('ownerLastName', String(matchedOwner.lastName ?? ''), { shouldValidate: true });
          setValue('ownerPhone', String(matchedOwner.phone ?? ''), { shouldValidate: true });
        } else {
          setExistingFarms([]);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Nie udalo sie pobrac danych wlasciciela.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingContext(false);
        }
      }
    };

    loadOwnershipContext();

    return () => {
      isMounted = false;
    };
  }, [currentUserEmail, setValue, user?.firstName, user?.lastName]);

  const onSubmit = async (data) => {
    setError(null);
    setSuccessMessage(null);
    setCreatedFarm(null);
    setIsSaving(true);

    try {
      if (!currentUserEmail) {
        setFormError('ownerEmail', {
          type: 'manual',
          message: 'Brak emaila zalogowanego uzytkownika. Zaloguj sie ponownie.',
        });
        return;
      }

      const normalizedCurrentEmail = normalizeEmail(currentUserEmail);
      const owners = await ownerService.fetchAll();
      let owner = owners.find((entry) => normalizeEmail(entry.email) === normalizedCurrentEmail) ?? null;

      const farmsBefore = await farmService.fetchAll();
      if (owner) {
        const ownerFarms = farmsBefore.filter((farm) => Number(farm.ownerId) === Number(owner.id));
        if (ownerFarms.length > 0) {
          setExistingOwner(owner);
          setExistingFarms(ownerFarms);
          setCreatedFarm(ownerFarms[0]);
          setSuccessMessage(
            `Znaleziono istniejace gospodarstwo przypisane do tego konta: ${ownerFarms[0].name}.`
          );
          return;
        }
      }

      if (!owner) {
        owner = await ownerService.add({
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          phone: data.ownerPhone,
          email: currentUserEmail,
        });
      }

      const farmsAfterOwnerResolution = await farmService.fetchAll();
      const ownerFarmsAfterResolution = farmsAfterOwnerResolution.filter(
        (farm) => Number(farm.ownerId) === Number(owner.id)
      );

      if (ownerFarmsAfterResolution.length > 0) {
        setExistingOwner(owner);
        setExistingFarms(ownerFarmsAfterResolution);
        setCreatedFarm(ownerFarmsAfterResolution[0]);
        setSuccessMessage(
          `Znaleziono istniejace gospodarstwo przypisane do tego konta: ${ownerFarmsAfterResolution[0].name}.`
        );
        return;
      }

      const newFarm = await farmService.add({
        name: data.farmName,
        address: data.farmAddress,
        type: data.farmType,
        area: data.farmArea,
        ownerId: owner.id,
      });

      setExistingOwner(owner);
      setExistingFarms([newFarm]);
      setCreatedFarm(newFarm);
      setSuccessMessage('Gospodarstwo zostalo utworzone i przypisane do Twojego konta.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Nie udalo sie zapisac gospodarstwa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <Header
        title="Dodaj gospodarstwo"
        subtitle="Utworz lub przypisz gospodarstwo do zalogowanego uzytkownika"
      />

      <div className={formStyles.formPage}>
        {isLoadingContext && <Alert type="info">Ladowanie danych wlasciciela...</Alert>}
        {error && <Alert type="error">{error}</Alert>}
        {successMessage && <Alert type="success">{successMessage}</Alert>}

        {createdFarm && (
          <Alert type="info">
            Aktywne gospodarstwo: <strong>{createdFarm.name}</strong>
          </Alert>
        )}

        {existingFarms.length > 0 && (
          <Alert type="info">
            To konto ma juz przypisane gospodarstwa: {existingFarms.map((farm) => farm.name).join(', ')}.
          </Alert>
        )}

        <div className={formStyles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={formStyles.formGrid}>
              <div className={`${formStyles.formGroup} ${formStyles.formGroupFull}`}>
                <label className={formStyles.label} htmlFor="ownerEmail">
                  Email wlasciciela (zalogowany uzytkownik)
                </label>
                <input
                  id="ownerEmail"
                  type="email"
                  className={`${formStyles.input} ${errors.ownerEmail ? formStyles.inputError : ''}`}
                  readOnly
                  {...register('ownerEmail')}
                />
                {errors.ownerEmail && <span className={formStyles.errorMessage}>{errors.ownerEmail.message}</span>}
              </div>

              {!existingOwner && (
                <>
                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label} htmlFor="ownerFirstName">
                      Imie wlasciciela
                    </label>
                    <input
                      id="ownerFirstName"
                      type="text"
                      className={`${formStyles.input} ${errors.ownerFirstName ? formStyles.inputError : ''}`}
                      {...register('ownerFirstName')}
                    />
                    {errors.ownerFirstName && (
                      <span className={formStyles.errorMessage}>{errors.ownerFirstName.message}</span>
                    )}
                  </div>

                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label} htmlFor="ownerLastName">
                      Nazwisko wlasciciela
                    </label>
                    <input
                      id="ownerLastName"
                      type="text"
                      className={`${formStyles.input} ${errors.ownerLastName ? formStyles.inputError : ''}`}
                      {...register('ownerLastName')}
                    />
                    {errors.ownerLastName && (
                      <span className={formStyles.errorMessage}>{errors.ownerLastName.message}</span>
                    )}
                  </div>

                  <div className={formStyles.formGroup}>
                    <label className={formStyles.label} htmlFor="ownerPhone">
                      Telefon wlasciciela
                    </label>
                    <input
                      id="ownerPhone"
                      type="text"
                      className={`${formStyles.input} ${errors.ownerPhone ? formStyles.inputError : ''}`}
                      placeholder="9 cyfr"
                      {...register('ownerPhone')}
                    />
                    {errors.ownerPhone && <span className={formStyles.errorMessage}>{errors.ownerPhone.message}</span>}
                  </div>
                </>
              )}

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="farmName">
                  Nazwa gospodarstwa
                </label>
                <input
                  id="farmName"
                  type="text"
                  className={`${formStyles.input} ${errors.farmName ? formStyles.inputError : ''}`}
                  {...register('farmName')}
                />
                {errors.farmName && <span className={formStyles.errorMessage}>{errors.farmName.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="farmAddress">
                  Adres gospodarstwa
                </label>
                <input
                  id="farmAddress"
                  type="text"
                  className={`${formStyles.input} ${errors.farmAddress ? formStyles.inputError : ''}`}
                  {...register('farmAddress')}
                />
                {errors.farmAddress && <span className={formStyles.errorMessage}>{errors.farmAddress.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="farmType">
                  Typ gospodarstwa
                </label>
                <select
                  id="farmType"
                  className={`${formStyles.select} ${errors.farmType ? formStyles.inputError : ''}`}
                  {...register('farmType')}
                >
                  <option value="">-- Wybierz --</option>
                  <option value="Mieszane">Mieszane</option>
                  <option value="Mleczne">Mleczne</option>
                  <option value="Miesne">Miesne</option>
                  <option value="Ekologiczne">Ekologiczne</option>
                </select>
                {errors.farmType && <span className={formStyles.errorMessage}>{errors.farmType.message}</span>}
              </div>

              <div className={formStyles.formGroup}>
                <label className={formStyles.label} htmlFor="farmArea">
                  Powierzchnia (ha)
                </label>
                <input
                  id="farmArea"
                  type="number"
                  min="0"
                  step="0.01"
                  className={`${formStyles.input} ${errors.farmArea ? formStyles.inputError : ''}`}
                  {...register('farmArea', { setValueAs: parseNumberWithComma })}
                />
                {errors.farmArea && <span className={formStyles.errorMessage}>{errors.farmArea.message}</span>}
              </div>

              <div className={formStyles.formActions}>
                <Button variant="secondary" onClick={goBackToForm}>
                  Wroc do formularza
                </Button>
                <Button variant="primary" type="submit" disabled={isSaving || isLoadingContext}>
                  {isSaving ? 'Zapisywanie...' : 'Zapisz gospodarstwo'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FarmSetupPage;
