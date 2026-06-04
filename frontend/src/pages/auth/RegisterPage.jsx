import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Alert } from '../../components/common/Common';
import styles from './Auth.module.css';

/* Registration form validation schema.
   Password must have minimum 6 characters, contain an uppercase letter, digit and special character.
   The password confirmation field must match the password. */
const registrationSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Adres e-mail jest wymagany')
      .email('Podaj prawidlowy adres e-mail'),
    password: z
      .string()
      .min(6, 'Haslo musi miec minimum 6 znakow')
      .regex(/[A-Z]/, 'Haslo musi zawierac co najmniej jedna wielka litere')
      .regex(/[0-9]/, 'Haslo musi zawierac co najmniej jedna cyfre')
      .regex(/[^a-zA-Z0-9]/, 'Haslo musi zawierac co najmniej jeden znak specjalny'),
    confirmPassword: z
      .string()
      .min(1, 'Potwierdzenie hasla jest wymagane'),
    accountType: z
      .string()
      .min(1, 'Wybierz typ konta'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasla musza byc identyczne',
    path: ['confirmPassword'],
  });

/* RegisterPage — registration form for a new user.
   The user selects an account type (Wlasciciel or Lekarz),
   which corresponds to the logic in AccountController on the backend. */

function RegisterPage() {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
  });

  const onSubmit = async (data) => {
    clearError();
    const success = await registerUser({
      email: data.email,
      password: data.password,
      accountType: data.accountType,
    });
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>Inwentarz</div>
          <h1 className={styles.authTitle}>Rejestracja</h1>
          <p className={styles.authSubtitle}>Utworz konto w systemie zarzadzania gospodarstwem</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* E-mail */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Adres e-mail
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="jan@kowalski.pl"
              {...register('email')}
            />
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Haslo
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Minimum 6 znakow"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Potwierdz haslo
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Powtorz haslo"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Account type */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="accountType">
              Typ konta
            </label>
            <select
              id="accountType"
              className={`${styles.select} ${errors.accountType ? styles.inputError : ''}`}
              {...register('accountType')}
            >
              <option value="">-- Wybierz typ konta --</option>
              <option value="Wlasciciel">Wlasciciel gospodarstwa</option>
              <option value="Lekarz">Lekarz weterynarii</option>
            </select>
            {errors.accountType && (
              <span className={styles.errorMessage}>{errors.accountType.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Tworzenie konta...' : 'Zarejestruj sie'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Masz juz konto? <Link to="/login">Zaloguj sie</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;