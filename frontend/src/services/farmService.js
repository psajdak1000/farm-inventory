import apiClient from './apiClient';

const mapApiFarmToUi = (farm) => ({
  id: farm.idGospodarstwa,
  name: farm.nazwa ?? '',
  address: farm.adres ?? '',
  type: farm.typ ?? '',
  area: farm.powierzchnia ?? 0,
  ownerId: farm.idWlasciciela ?? 0,
});

const getApiErrorMessage = (error, fallbackMessage) => {
  const apiData = error?.response?.data;

  if (typeof apiData === 'string' && apiData.trim()) {
    return apiData;
  }

  if (apiData && typeof apiData === 'object') {
    if (typeof apiData.message === 'string' && apiData.message.trim()) {
      return apiData.message;
    }

    if (typeof apiData.error === 'string' && apiData.error.trim()) {
      return apiData.error;
    }

    if (typeof apiData.title === 'string' && apiData.title.trim()) {
      return apiData.title;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const farmService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/gospodarstwa');
      return Array.isArray(response.data) ? response.data.map(mapApiFarmToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch farms.'));
    }
  },
};

export default farmService;
