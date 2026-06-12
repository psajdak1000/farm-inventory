import apiClient from './apiClient';

const mapApiOwnerToUi = (owner) => ({
  id: owner.idWlasciciela ?? owner.ownerId ?? owner.id ?? 0,
  firstName: owner.imie ?? owner.firstName ?? '',
  lastName: owner.nazwisko ?? owner.lastName ?? '',
  phone: owner.telefon ?? owner.phoneNumber ?? '',
  email: owner.eMail ?? owner.email ?? '',
});

const mapUiOwnerToApi = (owner) => {
  const firstName = String(owner?.firstName ?? '').trim();
  if (!firstName) {
    throw new Error('Imie wlasciciela jest wymagane.');
  }

  const lastName = String(owner?.lastName ?? '').trim();
  if (!lastName) {
    throw new Error('Nazwisko wlasciciela jest wymagane.');
  }

  const phone = String(owner?.phone ?? '').trim();
  if (!/^\d{9}$/.test(phone)) {
    throw new Error('Telefon wlasciciela musi miec dokladnie 9 cyfr.');
  }

  const email = String(owner?.email ?? '').trim();
  if (!email) {
    throw new Error('Email wlasciciela jest wymagany.');
  }

  return {
    imie: firstName,
    nazwisko: lastName,
    telefon: phone,
    eMail: email,
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

const ownerService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/wlasciciele');
      return Array.isArray(response.data) ? response.data.map(mapApiOwnerToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac listy wlascicieli.'));
    }
  },

  add: async (data) => {
    try {
      const payload = mapUiOwnerToApi(data);
      const response = await apiClient.post('/wlasciciele', payload);
      return mapApiOwnerToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie dodac wlasciciela.'));
    }
  },
};

export default ownerService;
