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

const normalizeOptionalString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapApiProcedureToUi = (procedure) => ({
  procedureId: procedure.idZabiegu,
  name: procedure.nazwa ?? '',
  procedureDate: procedure.data ?? '',
  description: procedure.opis ?? '',
  cost: procedure.koszt ?? 0,
  animalId: procedure.idZwierzecia ?? 0,
  veterinarianId: procedure.idLekarza ?? 0,
});

const mapUiProcedureToApi = (procedure) => {
  const name = String(procedure?.name ?? '').trim();
  if (!name) {
    throw new Error('Nazwa zabiegu jest wymagana.');
  }

  const procedureDate = String(procedure?.procedureDate ?? '').trim();
  if (!procedureDate) {
    throw new Error('Data zabiegu jest wymagana.');
  }

  const cost = parseRequiredNumber(procedure?.cost, 'Koszt');
  if (cost < 0) {
    throw new Error('Koszt nie moze byc ujemny.');
  }

  return {
    nazwa: name,
    data: procedureDate,
    opis: normalizeOptionalString(procedure?.description),
    koszt: cost,
    idZwierzecia: parsePositiveInt(procedure?.animalId, 'ID zwierzecia'),
    idLekarza: parsePositiveInt(procedure?.veterinarianId, 'ID lekarza'),
  };
};

const mapKnownBackendMessage = (message) => {
  const normalized = String(message ?? '').trim();

  if (!normalized) {
    return '';
  }

  if (normalized === 'Nie istnieje zwierze o podanym IdZwierzecia.') {
    return 'Zwierze o podanym ID nie istnieje. Wybierz istniejace zwierze z listy.';
  }

  if (normalized === 'Nie istnieje lekarz o podanym IdLekarza.') {
    return 'Lekarz o podanym ID nie istnieje. Wybierz istniejacego lekarza z listy.';
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

const procedureService = {
  fetchAll: async () => {
    try {
      const response = await apiClient.get('/zabiegi');
      return Array.isArray(response.data) ? response.data.map(mapApiProcedureToUi) : [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac zabiegow.'));
    }
  },

  fetchById: async (id) => {
    try {
      const procedureId = parsePositiveInt(id, 'ID zabiegu');
      const response = await apiClient.get(`/zabiegi/${procedureId}`);
      return mapApiProcedureToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie pobrac zabiegu.'));
    }
  },

  add: async (data) => {
    try {
      const payload = mapUiProcedureToApi(data);
      const response = await apiClient.post('/zabiegi', payload);
      return mapApiProcedureToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie dodac zabiegu.'));
    }
  },

  update: async (id, data) => {
    try {
      const procedureId = parsePositiveInt(id, 'ID zabiegu');
      const payload = mapUiProcedureToApi(data);
      const response = await apiClient.put(`/zabiegi/${procedureId}`, payload);
      return mapApiProcedureToUi(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie zaktualizowac zabiegu.'));
    }
  },

  remove: async (id) => {
    try {
      const procedureId = parsePositiveInt(id, 'ID zabiegu');
      await apiClient.delete(`/zabiegi/${procedureId}`);
      return true;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Nie udalo sie usunac zabiegu.'));
    }
  },
};

export default procedureService;
