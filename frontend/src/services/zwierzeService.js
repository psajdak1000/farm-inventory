import apiClient from './apiClient';

/* Serwis obsługujący operacje na zwierzętach.
   Odpowiada encji Zwierze z modelu backendowego. */

const zwierzeService = {
  /* Pobranie listy wszystkich zwierząt */
  pobierzWszystkie: async () => {
    const response = await apiClient.get('/zwierze');
    return response.data;
  },

  /* Pobranie pojedynczego zwierzęcia po ID */
  pobierzPoId: async (id) => {
    const response = await apiClient.get(`/zwierze/${id}`);
    return response.data;
  },

  /* Dodanie nowego zwierzęcia */
  dodaj: async (dane) => {
    const response = await apiClient.post('/zwierze', dane);
    return response.data;
  },

  /* Aktualizacja danych zwierzęcia */
  aktualizuj: async (id, dane) => {
    const response = await apiClient.put(`/zwierze/${id}`, dane);
    return response.data;
  },

  /* Usunięcie zwierzęcia */
  usun: async (id) => {
    const response = await apiClient.delete(`/zwierze/${id}`);
    return response.data;
  },
};

export default zwierzeService;
