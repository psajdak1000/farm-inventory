import apiClient from './apiClient';

/* Serwis obsługujący operacje na zabiegach weterynaryjnych.
   Odpowiada encji Zabieg z modelu backendowego. */

const zabiegService = {
  pobierzWszystkie: async () => {
    const response = await apiClient.get('/zabieg');
    return response.data;
  },

  pobierzPoId: async (id) => {
    const response = await apiClient.get(`/zabieg/${id}`);
    return response.data;
  },

  dodaj: async (dane) => {
    const response = await apiClient.post('/zabieg', dane);
    return response.data;
  },

  aktualizuj: async (id, dane) => {
    const response = await apiClient.put(`/zabieg/${id}`, dane);
    return response.data;
  },

  usun: async (id) => {
    const response = await apiClient.delete(`/zabieg/${id}`);
    return response.data;
  },
};

export default zabiegService;
