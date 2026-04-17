import apiClient from './apiClient';

/* Serwis odpowiedzialny za operacje autoryzacyjne.
   Komunikuje się z endpointami backendu dotyczącymi kont użytkowników. */

const authService = {
  /* Rejestracja nowego użytkownika */
  register: async (dane) => {
    const response = await apiClient.post('/account/register', dane);
    return response.data;
  },

  /* Logowanie — zwraca token JWT */
  login: async (dane) => {
    const response = await apiClient.post('/account/login', dane);
    return response.data;
  },

  /* Wylogowanie — informuje backend o zakończeniu sesji */
  logout: async () => {
    const response = await apiClient.post('/account/logout');
    return response.data;
  },

  /* Pobranie danych aktualnie zalogowanego użytkownika */
  pobierzProfil: async () => {
    const response = await apiClient.get('/account/profil');
    return response.data;
  },
};

export default authService;
