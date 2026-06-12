import apiClient from './apiClient';

const mapApiOwnerToUi = (owner) => ({
  id: owner.idWlasciciela ?? owner.ownerId ?? owner.id ?? 0,
  firstName: owner.imie ?? owner.firstName ?? '',
  lastName: owner.nazwisko ?? owner.lastName ?? '',
  phone: owner.telefon ?? owner.phoneNumber ?? '',
  email: owner.eMail ?? owner.email ?? '',
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

const ownerService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/wlasciciele');
      return Array.isArray(response.data) ? response.data.map(mapApiOwnerToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac listy wlascicieli.'));
    }
  },
};

export default ownerService;
