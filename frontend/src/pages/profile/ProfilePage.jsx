import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import useAuthStore from '../../stores/useAuthStore';
import Header from '../../components/layout/Header';
import { Button, Alert } from '../../components/common/Common';
import styles from './Profile.module.css';

/* Profile form validation schema */
const profileSchema = z.object({
  firstName: z.string().min(1, 'Imie jest wymagane').max(50, 'Maksymalnie 50 znakow'),
  lastName: z.string().min(1, 'Nazwisko jest wymagane').max(50, 'Maksymalnie 50 znakow'),
  phone: z.string().min(1, 'Telefon jest wymagany'),
  email: z.string().email('Podaj prawidlowy adres e-mail').optional(),
});

/* ProfilePage — allows the logged-in user to edit their own data.
   Corresponds to the "Edit own profile" use case from the UML diagram. */

function ProfilePage() {
  const { user, role } = useAuthStore();
  const [message, setMessage] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async () => {
    /* TODO: Send data to API after connecting the backend */
    setMessage({ type: 'success', content: 'Dane profilu zostaly zaktualizowane.' });
  };

  return (
    <div>
      <Header
        title="Moj profil"
        subtitle={`Rola: ${role || 'Nie przypisano'}`}
      />

      <div className={styles.profilePage}>
        {message && <Alert type={message.type}>{message.content}</Alert>}

        <div className={styles.profileCard}>
          <h2 className={styles.sectionTitle}>Dane osobowe</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className={styles.formGrid}>
              {/* First name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="firstName">Imie</label>
                <input
                  id="firstName"
                  type="text"
                  className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <span className={styles.errorMessage}>{errors.firstName.message}</span>
                )}
              </div>

              {/* Last name */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="lastName">Nazwisko</label>
                <input
                  id="lastName"
                  type="text"
                  className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <span className={styles.errorMessage}>{errors.lastName.message}</span>
                )}
              </div>

              {/* Phone */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="phone">Telefon</label>
                <input
                  id="phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                  {...register('phone')}
                />
                {errors.phone && (
                  <span className={styles.errorMessage}>{errors.phone.message}</span>
                )}
              </div>

              {/* E-mail — read only */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">E-mail</label>
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
                  Zapisz zmiany
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