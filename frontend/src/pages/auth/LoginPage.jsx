import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Alert } from '../../components/common/Common';
import styles from './Auth.module.css';

/* Schemat walidacji formularza logowania */
const schematLogowania = z.object({
  email: z
    .string()
    .min(1, 'Adres e-mail jest wymagany')
    .email('Podaj prawidlowy adres e-mail'),
  password: z
    .string()
    .min(1, 'Haslo jest wymagane'),
});

/* LoginPage — sign-in form with client-side validation.
   On successful login the user is redirected to the home page. */

function LoginPage() {
  const {
    zaloguj: login,
    ladowanie: isLoading,
    blad: error,
    wyczyscBlad: clearError,
  } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schematLogowania),
  });

  const onSubmit = async (data) => {
    clearError();
    const isSuccess = await login(data);
    if (isSuccess) {
      navigate('/');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Form header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>Inwentarz</div>
          <h1 className={styles.authTitle}>Sign in</h1>
          <p className={styles.authSubtitle}>Sign in to the farm management system</p>
        </div>

        {/* Server error message */}
        {error && <Alert type="error">{error}</Alert>}

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email field */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Email address
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
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
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
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer with link to registration */}
        <div className={styles.authFooter}>
          No account yet? <Link to="/rejestracja">Create one</Link>
        </div>

        {/* Demo accounts for testing without backend */}
        <div className={styles.demoSection}>
          <div className={styles.demoTitle}>Demo accounts</div>
          <div className={styles.demoAccount}>
            <strong>Owner:</strong> jan@kowalski.pl / Haslo123!
          </div>
          <div className={styles.demoAccount}>
            <strong>Veterinarian:</strong> anna@nowak.pl / Haslo123!
          </div>
          <div className={styles.demoAccount}>
            <strong>Admin:</strong> admin@system.pl / Haslo123!
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
