import apiClient from './apiClient';

const normalizeNumberString = (value) => String(value).trim().replace(',', '.');

const parsePositiveInt = (value, fieldName) => {
  const normalized = normalizeNumberString(value ?? '');
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${fieldName} musi byc dodatnia liczba calkowita.`);
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} musi byc dodatnia liczba calkowita.`);
  }

  return parsed;
};

const parseRequiredNumber = (value, fieldName) => {
  const normalized = normalizeNumberString(value ?? '');
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} musi byc poprawna liczba.`);
  }

  return parsed;
};

const parseQuantityToApiString = (value) => {
  const quantityNumber = parseRequiredNumber(value, 'Ilosc');
  if (quantityNumber < 0) {
    throw new Error('Ilosc nie moze byc ujemna.');
  }

  return String(quantityNumber);
};

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapApiFeedingToUi = (feeding) => ({
  feedingId: feeding.idKarmienia,
  name: feeding.nazwa ?? '',
  type: feeding.rodzaj ?? '',
  quantity: feeding.ilosc ?? '',
  price: feeding.cena ?? 0,
  purchaseDate: feeding.dataZakupu ?? '',
  animalId: feeding.idZwierzecia ?? 0,
});

const mapUiFeedingToApi = (feeding) => {
  const name = String(feeding?.name ?? '').trim();
  if (!name) {
    throw new Error('Nazwa paszy jest wymagana.');
  }

  const purchaseDate = String(feeding?.purchaseDate ?? '').trim();
  if (!purchaseDate) {
    throw new Error('Data zakupu jest wymagana.');
  }

  const payload = {
    nazwa: name,
    rodzaj: normalizeOptionalString(feeding?.type),
    ilosc: parseQuantityToApiString(feeding?.quantity),
    cena: parseRequiredNumber(feeding?.price, 'Cena'),
    dataZakupu: purchaseDate,
    idZwierzecia: parsePositiveInt(feeding?.animalId, 'ID zwierzecia'),
  };

  if (payload.cena < 0) {
    throw new Error('Cena nie moze byc ujemna.');
  }

  return payload;
};

const mapKnownBackendMessage = (message) => {
  const normalized = String(message ?? '').trim();

  if (!normalized) {
    return '';
  }

  if (normalized === 'Nie istnieje zwierze o podanym IdZwierzecia.') {
    return 'Zwierze o podanym ID nie istnieje. Wybierz istniejace zwierze z listy.';
  }

  return normalized;
};

const extractValidationMessages = (errorsObject) => {
  if (!errorsObject || typeof errorsObject !== 'object') {
    return '';
  }

  const messages = Object.values(errorsObject)
    .flatMap((entry) => (Array.isArray(entry) ? entry : []))
    .filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim());

  return messages.join(' ');
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return mapKnownBackendMessage(responseData);
  }

  if (responseData && typeof responseData === 'object') {
    const validationMessages = extractValidationMessages(responseData.errors);
    if (validationMessages) {
      return mapKnownBackendMessage(validationMessages);
    }

    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return mapKnownBackendMessage(responseData.message);
    }

    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      return mapKnownBackendMessage(responseData.error);
    }

    if (typeof responseData.title === 'string' && responseData.title.trim()) {
      return mapKnownBackendMessage(responseData.title);
    }
  }

  if (error instanceof Error && error.message) {
    return mapKnownBackendMessage(error.message);
  }

  return fallbackMessage;
};

const feedingService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/karmienia');
      return Array.isArray(response.data) ? response.data.map(mapApiFeedingToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac karmien.'));
    }
  },

  fetchById: async (id) => {
    try {
      const feedingId = parsePositiveInt(id, 'ID karmienia');
      const response = await apiClient.get(`/karmienia/${feedingId}`);
      return mapApiFeedingToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac karmienia.'));
    }
  },

  add: async (data) => {
    try {
      const payload = mapUiFeedingToApi(data);
      const response = await apiClient.post('/karmienia', payload);
      return mapApiFeedingToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie dodac karmienia.'));
    }
  },

  update: async (id, data) => {
    try {
      const feedingId = parsePositiveInt(id, 'ID karmienia');
      const payload = mapUiFeedingToApi(data);
      const response = await apiClient.put(`/karmienia/${feedingId}`, payload);
      return mapApiFeedingToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie zaktualizowac karmienia.'));
    }
  },

  remove: async (id) => {
    try {
      const feedingId = parsePositiveInt(id, 'ID karmienia');
      await apiClient.delete(`/karmienia/${feedingId}`);
      return true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie usunac karmienia.'));
    }
  },
};

export default feedingService;
