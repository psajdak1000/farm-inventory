import apiClient from './apiClient';

const normalizeNumberString = (value) => String(value).trim().replace(',', '.');

const parsePositiveInt = (value, fieldName) => {
  const normalized = normalizeNumberString(value ?? '');
  if (!/^\d+$/.test(normalized)) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive integer.`);
  }
  return parsed;
};

const parseRequiredNumber = (value, fieldName) => {
  const normalized = normalizeNumberString(value ?? '');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldName} must be a valid number.`);
  }
  return parsed;
};

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const normalized = normalizeNumberString(value);
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
};

const normalizeSex = (value) => {
  const normalized = String(value ?? '').trim();
  if (!normalized) {
    throw new Error('Sex is required.');
  }

  const lowered = normalized.toLowerCase();
  if (lowered === 'male') {
    return 'Samiec';
  }

  if (lowered === 'female') {
    return 'Samica';
  }

  return normalized;
};

const normalizeOptionalDate = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapApiAnimalToUi = (animal) => ({
  animalId: animal.id,
  eartagId: String(animal.earTagId ?? ''),
  breed: animal.breed ?? '',
  gender: animal.sex ?? '',
  age: animal.age ?? 0,
  weight: animal.weight ?? 0,
  purchaseOrBirthDate: animal.acquisitionDate ?? '',
  purchasePrice: animal.purchasePrice,
  saleOrDeathDate: animal.departureDate,
  salePrice: animal.salePrice,
  farmId: animal.farmId ?? 0,
});

const mapUiAnimalToApi = (animal) => {
  const earTagId = parsePositiveInt(animal?.eartagId, 'Ear tag ID');

  const breed = String(animal?.breed ?? '').trim();
  if (!breed) {
    throw new Error('Breed is required.');
  }

  const sex = normalizeSex(animal?.gender);

  const acquisitionDate = String(animal?.purchaseOrBirthDate ?? '').trim();
  if (!acquisitionDate) {
    throw new Error('Acquisition date is required.');
  }

  const farmId = parsePositiveInt(animal?.farmId, 'Farm ID');
  const weight = parseRequiredNumber(animal?.weight, 'Weight');

  const ageValue = parseOptionalNumber(animal?.age);
  const age = ageValue === null ? null : Math.trunc(ageValue);
  const purchasePrice = parseOptionalNumber(animal?.purchasePrice);
  const salePrice = parseOptionalNumber(animal?.salePrice);

  return {
    earTagId,
    breed,
    age,
    sex,
    weight,
    acquisitionDate,
    purchasePrice,
    departureDate: normalizeOptionalDate(animal?.saleOrDeathDate),
    salePrice,
    farmId,
  };
};

const mapKnownBackendMessage = (message) => {
  const normalized = String(message ?? '').trim();

  if (!normalized) {
    return '';
  }

  if (normalized === 'Farm with the specified ID does not exist.') {
    return 'Gospodarstwo o podanym ID nie istnieje. Podaj istniejace ID gospodarstwa.';
  }

  if (normalized === 'Cannot delete animal because it is referenced by other records.') {
    return 'Nie mozna usunac zwierzecia, poniewaz ma przypisane karmienia lub zabiegi. Najpierw usun powiazane rekordy albo pozostaw zwierze w ewidencji.';
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

const animalService = {
  fetchAll: async () => {
    const response = await apiClient.get('/animals');
    return Array.isArray(response.data) ? response.data.map(mapApiAnimalToUi) : [];
  },

  fetchById: async (id) => {
    const animalId = parsePositiveInt(id, 'Animal ID');
    const response = await apiClient.get(`/animals/${animalId}`);
    return mapApiAnimalToUi(response.data);
  },

  add: async (data) => {
    try {
      const payload = mapUiAnimalToApi(data);
      const response = await apiClient.post('/animals', payload);
      return mapApiAnimalToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to add animal.'));
    }
  },

  update: async (id, data) => {
    try {
      const animalId = parsePositiveInt(id, 'Animal ID');
      const payload = mapUiAnimalToApi(data);
      const response = await apiClient.put(`/animals/${animalId}`, payload);
      return mapApiAnimalToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update animal.'));
    }
  },

  remove: async (id) => {
    const animalId = parsePositiveInt(id, 'Animal ID');
    await apiClient.delete(`/animals/${animalId}`);
    return true;
  },
};

export default animalService;
