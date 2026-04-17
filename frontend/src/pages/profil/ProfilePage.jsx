import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import styles from './Profil.module.css';

/* Schemat walidacji danych profilowych */
const schematProfilu = z.object({
  imie: z.string().min(1, 'Imie jest wymagane').max(50, 'Maksymalnie 50 znakow'),
  nazwisko: z.string().min(1, 'Nazwisko jest wymagane').max(50, 'Maksymalnie 50 znakow'),
  telefon: z.string().min(1, 'Telefon jest wymagany'),
  email: z.string().email('Podaj prawidlowy adres e-mail').optional(),
});

/* ProfilePage — lets the signed-in user edit profile details. */

function ProfilePage() {
  const { uzytkownik, rola } = useAuthStore();
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schematProfilu),
    defaultValues: {
      imie: uzytkownik?.imie || '',
      nazwisko: uzytkownik?.nazwisko || '',
      telefon: uzytkownik?.telefon || '',
      email: uzytkownik?.email || '',
    },
  });

  const onSubmit = async () => {
    /* TODO: Send profile updates to API once backend integration is enabled. */
    setMessage({ type: 'success', content: 'Profile details have been updated.' });
  };

  return (
    <div>
      <Header
        title="My profile"
        subtitle={`Role: ${rola || 'Unassigned'}`}
      />

      <div className={styles.profilPage}>
        {message && <Alert type={message.type}>{message.content}</Alert>}

        <div className={styles.profilCard}>
          <h2 className={styles.sectionTitle}>Personal details</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              {/* First name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="imie">First name</label>
                <input
                  id="imie"
                  type="text"
                  className={`${styles.input} ${errors.imie ? styles.inputError : ''}`}
                  {...register('imie')}
                />
                {errors.imie && (
                  <span className={styles.errorMessage}>{errors.imie.message}</span>
                )}
              </div>

              {/* Last name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="nazwisko">Last name</label>
                <input
                  id="nazwisko"
                  type="text"
                  className={`${styles.input} ${errors.nazwisko ? styles.inputError : ''}`}
                  {...register('nazwisko')}
                />
                {errors.nazwisko && (
                  <span className={styles.errorMessage}>{errors.nazwisko.message}</span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="telefon">Phone</label>
                <input
                  id="telefon"
                  type="tel"
                  className={`${styles.input} ${errors.telefon ? styles.inputError : ''}`}
                  {...register('telefon')}
                />
                {errors.telefon && (
                  <span className={styles.errorMessage}>{errors.telefon.message}</span>
                )}
              </div>

              {/* Email — read only */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  disabled
                  {...register('email')}
                />
              </div>

              <div className={styles.formActions}>
                <Button variant="primary" type="submit">
                  Save changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
