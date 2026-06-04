import apiClient from './apiClient';

/* Service handling operations on animals.
   Corresponds to the Animal entity from the backend model. */

const animalService = {
  /* Fetch list of all animals */
  fetchAll: async () => {
    const response = await apiClient.get('/zwierze');
    return response.data;
  },

  /* Fetch a single animal by ID */
  fetchById: async (id) => {
    const response = await apiClient.get(`/zwierze/${id}`);
    return response.data;
  },

  /* Add a new animal */
  add: async (data) => {
    const response = await apiClient.post('/zwierze', data);
    return response.data;
  },

  /* Update animal data */
  update: async (id, data) => {
    const response = await apiClient.put(`/zwierze/${id}`, data);
    return response.data;
  },

  /* Remove an animal */
  remove: async (id) => {
    const response = await apiClient.delete(`/zwierze/${id}`);
    return response.data;
  },
};

export default animalService;