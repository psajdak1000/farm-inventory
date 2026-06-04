import apiClient from './apiClient';

/* Serwis odpowiedzialny za operacje autoryzacyjne.
   Komunikuje się z endpointami backendu dotyczącymi kont użytkowników. */

const authService = {
  /* Rejestracja nowego użytkownika */
  register: async (dane) => {
    const response = await apiClient.post('/auth/register', dane);
    return response.data;
  },

  /* Logowanie — zwraca token JWT */
  login: async (dane) => {
    const response = await apiClient.post('/auth/login', dane);
    return response.data;
  },

  /* Wylogowanie — informuje backend o zakończeniu sesji */
  logout: async () => {
    const response = await apiClient.post('/account/logout');
    return response.data;
  },

  /* Fetch currently logged-in user data */
  fetchProfile: async () => {
    const response = await apiClient.get('/account/profil');
    return response.data;
  },
};

export default authService;
