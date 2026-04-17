import axios from 'axios';

/* Bazowy adres API backendu.
   W produkcji zostanie nadpisany przez zmienną środowiskową VITE_API_URL.
   Na czas developmentu wskazuje na lokalny serwer .NET. */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7145/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/* Interceptor zapytań — dołącza token autoryzacji do każdego żądania */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* Interceptor odpowiedzi — obsługuje błędy globalne (np. wygaśnięcie sesji) */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/logowanie';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
