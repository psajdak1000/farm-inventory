import apiClient from './apiClient';

/* Service handling operations on feedings.
   Corresponds to the Feeding entity from the backend model. */

const feedingService = {
  fetchAll: async () => {
    const response = await apiClient.get('/karmienie');
    return response.data;
  },

  fetchById: async (id) => {
    const response = await apiClient.get(`/karmienie/${id}`);
    return response.data;
  },

  add: async (data) => {
    const response = await apiClient.post('/karmienie', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/karmienie/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/karmienie/${id}`);
    return response.data;
  },
};

export default feedingService;