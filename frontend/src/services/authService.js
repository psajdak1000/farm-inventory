import apiClient from './apiClient';

const AUTH_STORAGE_KEYS = [
  'authToken',
  'userRole',
  'demoUser',
  'authUser',
  'authProfile',
  'authMe',
];

export const clearAuthStorage = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Local logout only. Backend has no dedicated logout endpoint.
  logout: () => {
    clearAuthStorage();
  },

  fetchProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export default authService;
