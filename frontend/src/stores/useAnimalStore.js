import { create } from 'zustand';
import animalService from '../services/animalService';

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

const useAnimalStore = create((set, get) => ({
  animals: [],
  selectedAnimal: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });

    try {
      const animals = await animalService.fetchAll();
      set({ animals });
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to fetch animals.') });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const animal = await animalService.fetchById(id);
      set({ selectedAnimal: animal });
    } catch (error) {
      set({
        selectedAnimal: null,
        error: getErrorMessage(error, 'Animal with the specified ID was not found.'),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const createdAnimal = await animalService.add(data);
      set((state) => ({
        animals: [...state.animals, createdAnimal],
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to add animal.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  update: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedAnimal = await animalService.update(id, data);
      set((state) => ({
        animals: state.animals.map((animal) =>
          animal.animalId === updatedAnimal.animalId ? updatedAnimal : animal
        ),
        selectedAnimal:
          state.selectedAnimal?.animalId === updatedAnimal.animalId
            ? updatedAnimal
            : state.selectedAnimal,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to update animal.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await animalService.remove(id);
      set((state) => ({
        animals: state.animals.filter((animal) => animal.animalId !== id),
        selectedAnimal:
          state.selectedAnimal?.animalId === id ? null : state.selectedAnimal,
      }));
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, 'Failed to delete animal.') });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  clearSelected: () => set({ selectedAnimal: null }),
  clearError: () => set({ error: null }),
}));

export default useAnimalStore;
