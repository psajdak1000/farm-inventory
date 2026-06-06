import { create } from 'zustand';
import feedingService from '../services/feedingService';

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

const useFeedingStore = create((set) => ({
  feedings: [],
  selectedFeeding: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const feedings = await feedingService.fetchAll();
      set({ feedings });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie pobrac karmien.') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const feeding = await feedingService.fetchById(id);
      set({ selectedFeeding: feeding });
    } catch (error) {
      set({
        selectedFeeding: null,
        error: getErrorMessage(error, 'Nie udalo sie pobrac karmienia.'),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const createdFeeding = await feedingService.add(data);
      set((state) => ({
        feedings: [...state.feedings, createdFeeding],
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie dodac karmienia.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedFeeding = await feedingService.update(id, data);
      set((state) => ({
        feedings: state.feedings.map((feeding) =>
          feeding.feedingId === updatedFeeding.feedingId ? updatedFeeding : feeding
        ),
        selectedFeeding:
          state.selectedFeeding?.feedingId === updatedFeeding.feedingId
            ? updatedFeeding
            : state.selectedFeeding,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie zaktualizowac karmienia.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await feedingService.remove(id);
      set((state) => ({
        feedings: state.feedings.filter((feeding) => feeding.feedingId !== id),
        selectedFeeding:
          state.selectedFeeding?.feedingId === id ? null : state.selectedFeeding,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Nie udalo sie usunac karmienia.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedFeeding: null }),
  clearError: () => set({ error: null }),
}));

export default useFeedingStore;
