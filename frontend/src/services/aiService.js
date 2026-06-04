import apiClient from './apiClient';

const aiService = {
  askAi: async (message) => {
    const response = await apiClient.post('/ai/chat', { message });
    return response.data;
  },
};

export default aiService;
