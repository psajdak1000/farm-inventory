import apiClient from './apiClient';

const mapApiFarmToUi = (farm) => ({
  id: farm.idGospodarstwa ?? farm.idGodpodarstwa ?? farm.id ?? 0,
  name: farm.nazwa ?? '',
  address: farm.adres ?? '',
  type: farm.typ ?? '',
  area: farm.powierzchnia ?? 0,
  ownerId: farm.idWlasciciela ?? farm.ownerId ?? 0,
});

const mapUiFarmToApi = (farm) => {
  const name = String(farm?.name ?? '').trim();
  if (!name) {
    throw new Error('Nazwa gospodarstwa jest wymagana.');
  }

  const address = String(farm?.address ?? '').trim();
  if (!address) {
    throw new Error('Adres gospodarstwa jest wymagany.');
  }

  const type = String(farm?.type ?? '').trim();
  if (!type) {
    throw new Error('Typ gospodarstwa jest wymagany.');
  }

  const area = Number(String(farm?.area ?? '0').trim().replace(',', '.'));
  if (!Number.isFinite(area) || area < 0) {
    throw new Error('Powierzchnia gospodarstwa musi byc liczba nieujemna.');
  }

  const ownerId = Number(farm?.ownerId);
  if (!Number.isInteger(ownerId) || ownerId <= 0) {
    throw new Error('Brak poprawnego ID wlasciciela.');
  }

  return {
    nazwa: name,
    adres: address,
    typ: type,
    powierzchnia: area,
    idWlasciciela: ownerId,
  };
};

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

  add: async (data) => {
    try {
      const payload = mapUiFarmToApi(data);
      const response = await apiClient.post('/gospodarstwa', payload);
      return mapApiFarmToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie dodac gospodarstwa.'));
    }
  },
};

export default farmService;
