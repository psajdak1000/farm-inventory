import apiClient from './apiClient';

/* Serwis obsługujący operacje na karmieniach.
   Odpowiada encji Karmienie z modelu backendowego. */

const karmienieService = {
  pobierzWszystkie: async () => {
    const response = await apiClient.get('/karmienie');
    return response.data;
  },

  pobierzPoId: async (id) => {
    const response = await apiClient.get(`/karmienie/${id}`);
    return response.data;
  },

  dodaj: async (dane) => {
    const response = await apiClient.post('/karmienie', dane);
    return response.data;
  },

  aktualizuj: async (id, dane) => {
    const response = await apiClient.put(`/karmienie/${id}`, dane);
    return response.data;
  },

  usun: async (id) => {
    const response = await apiClient.delete(`/karmienie/${id}`);
    return response.data;
  },
};

export default karmienieService;
