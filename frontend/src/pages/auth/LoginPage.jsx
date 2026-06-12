import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Alert } from '../../components/common/Common';
import styles from './Auth.module.css';

/* Login form validation schema */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Adres e-mail jest wymagany')
    .email('Podaj prawidlowy adres e-mail'),
  password: z
    .string()
    .min(1, 'Haslo jest wymagane'),
});

/* LoginPage — login form with client-side validation.
   After successful login the user is redirected to the home page.
   Validation errors are displayed directly next to the relevant fields. */

function LoginPage() {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    clearError();
    const success = await login(data);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Form header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>Inwentarz</div>
          <h1 className={styles.authTitle}>Logowanie</h1>
          <p className={styles.authSubtitle}>Zaloguj sie do systemu zarzadzania gospodarstwem</p>
        </div>

        {/* Server error message */}
        {error && <Alert type="error">{error}</Alert>}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email field */}
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

          {/* Password field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Haslo
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Wpisz haslo"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj sie'}
          </button>
        </form>

        {/* Footer with registration link */}
        <div className={styles.authFooter}>
          Nie masz konta? <Link to="/register">Zarejestruj sie</Link>
        </div>

        
      </div>
    </div>
  );
}

export default LoginPage;