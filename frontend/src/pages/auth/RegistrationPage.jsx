import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import { Alert } from '../../components/common/Common';
import styles from './Auth.module.css';

/* Schemat walidacji formularza rejestracji.
   Haslo musi miec minimum 6 znakow, zawierac wielka litere, cyfre i znak specjalny.
   Pole potwierdzenia hasla musi byc identyczne z haslem. */
const schematRejestracji = z
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
    typKonta: z
      .string()
      .min(1, 'Wybierz typ konta'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasla musza byc identyczne',
    path: ['confirmPassword'],
  });

/* RegistrationPage — form for creating a new user account.
   Account type values are preserved to match existing backend/store expectations. */

function RegistrationPage() {
  const {
    zarejestruj: registerUser,
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
    resolver: zodResolver(schematRejestracji),
  });

  const onSubmit = async (data) => {
    clearError();
    const isSuccess = await registerUser({
      email: data.email,
      password: data.password,
      typKonta: data.typKonta,
    });
    if (isSuccess) {
      navigate('/');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        {/* Header */}
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>Inwentarz</div>
          <h1 className={styles.authTitle}>Create account</h1>
          <p className={styles.authSubtitle}>Create an account in the farm management system</p>
        </div>

        {error && <Alert type="error">{error}</Alert>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
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

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="Minimum 6 characters"
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="Repeat your password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Account type */}
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="typKonta">
              Account type
            </label>
            <select
              id="typKonta"
              className={`${styles.select} ${errors.typKonta ? styles.inputError : ''}`}
              {...register('typKonta')}
            >
              <option value="">-- Select account type --</option>
              <option value="Wlasciciel">Farm owner</option>
              <option value="Lekarz">Veterinarian</option>
            </select>
            {errors.typKonta && (
              <span className={styles.errorMessage}>{errors.typKonta.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className={styles.authFooter}>
          Already have an account? <Link to="/logowanie">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
