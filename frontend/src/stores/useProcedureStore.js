import { create } from 'zustand';
import procedureService from '../services/procedureService';

const getErrorMessage = (error, fallbackMessage) => {
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
  }

  if (typeof apiData?.message === 'string' && apiData.message.trim()) {
    return apiData.message;
  }

  if (typeof apiData?.error === 'string' && apiData.error.trim()) {
    return apiData.error;
  }

  if (typeof apiData?.title === 'string' && apiData.title.trim()) {
    return apiData.title;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const useProcedureStore = create((set) => ({
  procedures: [],
  selectedProcedure: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const procedures = await procedureService.fetchAll();
      set({ procedures });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie pobrac zabiegow.') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const procedure = await procedureService.fetchById(id);
      set({ selectedProcedure: procedure });
    } catch (error) {
      set({
        selectedProcedure: null,
        error: getErrorMessage(error, 'Nie udalo sie pobrac zabiegu.'),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const createdProcedure = await procedureService.add(data);
      set((state) => ({
        procedures: [...state.procedures, createdProcedure],
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie dodac zabiegu.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedProcedure = await procedureService.update(id, data);
      set((state) => ({
        procedures: state.procedures.map((procedure) =>
          procedure.procedureId === updatedProcedure.procedureId ? updatedProcedure : procedure
        ),
        selectedProcedure:
          state.selectedProcedure?.procedureId === updatedProcedure.procedureId
            ? updatedProcedure
            : state.selectedProcedure,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie zaktualizowac zabiegu.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await procedureService.remove(id);
      set((state) => ({
        procedures: state.procedures.filter((procedure) => procedure.procedureId !== id),
        selectedProcedure:
          state.selectedProcedure?.procedureId === id ? null : state.selectedProcedure,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie usunac zabiegu.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedProcedure: null }),
  clearError: () => set({ error: null }),
}));

export default useProcedureStore;
