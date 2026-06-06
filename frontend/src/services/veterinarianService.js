import apiClient from './apiClient';

const normalizePhone = (value) => {
  const digitsOnly = String(value ?? '').trim().replace(/\s+/g, '');
  if (!/^\d+$/.test(digitsOnly)) {
    throw new Error('Telefon lekarza musi zawierac tylko cyfry.');
  }

  const parsed = Number(digitsOnly);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('Telefon lekarza musi byc poprawna liczba.');
  }

  return parsed;
};

const mapApiVeterinarianToUi = (veterinarian) => ({
  id: veterinarian.idLekarza,
  firstName: veterinarian.imie ?? '',
  lastName: veterinarian.nazwisko ?? '',
  phone: veterinarian.telefon ?? '',
});

const mapUiVeterinarianToApi = (veterinarian) => {
  const firstName = String(veterinarian?.firstName ?? '').trim();
  if (!firstName) {
    throw new Error('Imie lekarza jest wymagane.');
  }

  const lastName = String(veterinarian?.lastName ?? '').trim();
  if (!lastName) {
    throw new Error('Nazwisko lekarza jest wymagane.');
  }

  return {
    imie: firstName,
    nazwisko: lastName,
    telefon: normalizePhone(veterinarian?.phone),
  };
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const apiData = error?.response?.data;

  if (typeof apiData === 'string' && apiData.trim()) {
    return apiData;
  }

  if (apiData && typeof apiData === 'object') {
    const validationMessages = Object.values(apiData.errors ?? {})
      .flatMap((entry) => (Array.isArray(entry) ? entry : []))
      .filter((entry) => typeof entry === 'string' && entry.trim().length > 0);

    if (validationMessages.length > 0) {
      return validationMessages.join(' ');
    }

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

const veterinarianService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/lekarze');
      return Array.isArray(response.data) ? response.data.map(mapApiVeterinarianToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac lekarzy.'));
    }
  },

  add: async (data) => {
    try {
      const payload = mapUiVeterinarianToApi(data);
      const response = await apiClient.post('/lekarze', payload);
      return mapApiVeterinarianToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie dodac lekarza.'));
    }
  },
};

export default veterinarianService;
