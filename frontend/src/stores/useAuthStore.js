import { create } from 'zustand';
import authService, { clearAuthStorage } from '../services/authService';

/* Flag for demo mode — when the backend is unavailable, login
   works on local data without server communication.
   After connecting the backend just change to false and uncomment
   the authService import. */
const DEMO_MODE = false;

/* Test user data in demo mode */
const DEMO_USERS = {
  'jan@kowalski.pl': {
    haslo: 'Haslo123!',
    user: { firstName: 'Jan', lastName: 'Kowalski', email: 'jan@kowalski.pl', phone: '123456789' },
    role: 'Wlasciciel',
    token: 'demo-token-wlasciciel',
  },
  'anna@nowak.pl': {
    haslo: 'Haslo123!',
    user: { firstName: 'Anna', lastName: 'Nowak', email: 'anna@nowak.pl', phone: '987654321' },
    role: 'Lekarz',
    token: 'demo-token-lekarz',
  },
  'admin@system.pl': {
    haslo: 'Haslo123!',
    user: { firstName: 'Admin', lastName: 'Systemowy', email: 'admin@system.pl', phone: '111222333' },
    role: 'Administrator',
    token: 'demo-token-admin',
  },
};

/* Store responsible for auth state throughout the application.
   Stores data of the logged-in user, their role, and token.
   State change in this store triggers re-render in all components
   that use it — fulfills the reactivity requirement for global state. */

const useAuthStore = create((set) => ({
  /* Initial state */
  user: JSON.parse(localStorage.getItem('demoUser') || 'null'),
  token: localStorage.getItem('authToken') || null,
  role: localStorage.getItem('userRole') || null,
  isLoggedIn: !!localStorage.getItem('authToken'),
  isLoading: false,
  error: null,

  /* Log in the user */
  login: async (data) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      /* Simulate network delay */
      await new Promise((resolve) => setTimeout(resolve, 500));

      const account = DEMO_USERS[data.email];
      if (!account || account.haslo !== data.password) {
        set({
          error: 'Nieprawidlowy email lub haslo. Uzyj jednego z kont demo (szczegoly na stronie logowania).',
          isLoading: false,
        });
        return false;
      }

      localStorage.setItem('authToken', account.token);
      localStorage.setItem('userRole', account.role);
      localStorage.setItem('demoUser', JSON.stringify(account.user));
      set({
        user: account.user,
        token: account.token,
        role: account.role,
        isLoggedIn: true,
        isLoading: false,
      });
      return true;
    }

    /* API login — active when DEMO_MODE = false */
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      const token = response?.accessToken;
      if (!token) {
        set({
          error: 'Nie udalo sie zalogowac. Brak tokena w odpowiedzi.',
          isLoading: false,
        });
        return false;
      }

      const role = response?.user?.roles?.[0] || 'User';
      const user = {
        firstName: response?.user?.userName || response?.user?.email || data.email,
        lastName: '',
        email: response?.user?.email || data.email,
        phone: '',
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('demoUser', JSON.stringify(user));

      set({
        user,
        token,
        role,
        isLoggedIn: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      const fallback = 'Nie udalo sie zalogowac';
      const apiMessage =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message;
      set({
        error: apiMessage || fallback,
        isLoading: false,
      });
      return false;
    }
  },

  /* Register a new user */
  register: async (data) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newUser = {
        firstName: 'Nowy',
        lastName: 'Uzytkownik',
        email: data.email,
        phone: '000000000',
      };
      const role = data.accountType || 'Wlasciciel';
      const token = 'demo-token-nowy';

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('demoUser', JSON.stringify(newUser));
      set({
        user: newUser,
        token: token,
        role: role,
        isLoggedIn: true,
        isLoading: false,
      });
      return true;
    }

    try {
      await authService.register({
        email: data.email,
        password: data.password,
      });

      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });

      const token = loginResponse?.accessToken;
      if (!token) {
        set({
          error: 'Rejestracja udana, ale logowanie nie zwrocilo tokena.',
          isLoading: false,
        });
        return false;
      }

      const role = loginResponse?.user?.roles?.[0] || 'User';
      const user = {
        firstName: loginResponse?.user?.userName || loginResponse?.user?.email || data.email,
        lastName: '',
        email: loginResponse?.user?.email || data.email,
        phone: '',
      };

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('demoUser', JSON.stringify(user));

      set({
        user,
        token,
        role,
        isLoggedIn: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      const fallback = 'Nie udalo sie zarejestrowac';
      const apiMessage =
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message;
      set({
        error: apiMessage || fallback,
        isLoading: false,
      });
      return false;
    }
  },

  /* Logout */
  logout: () => {
    clearAuthStorage();
    set({
      user: null,
      token: null,
      role: null,
      isLoggedIn: false,
      error: null,
    });
  },

  /* Clear error message */
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
