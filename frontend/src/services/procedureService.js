import apiClient from './apiClient';

/* Service handling operations on veterinary procedures.
   Corresponds to the Procedure entity from the backend model. */

const procedureService = {
  fetchAll: async () => {
    const response = await apiClient.get('/zabieg');
    return response.data;
  },

  fetchById: async (id) => {
    const response = await apiClient.get(`/zabieg/${id}`);
    return response.data;
  },

  add: async (data) => {
    const response = await apiClient.post('/zabieg', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/zabieg/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await apiClient.delete(`/zabieg/${id}`);
    return response.data;
  },
};

export default procedureService;