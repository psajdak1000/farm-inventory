import { create } from 'zustand';

/* Flag for demo mode — test data instead of API requests.
   After connecting the backend change to false and uncomment the service import. */
const DEMO_MODE = true;

/* import animalService from '../services/animalService'; */

/* Test data for animals */
const DEMO_ANIMALS = [
  {
    animalId: 1,
    eartagId: 'PL005123456789',
    breed: 'Holstein-Friesian',
    gender: 'Samica',
    age: 4,
    weight: 620,
    purchaseOrBirthDate: '2022-03-15',
    purchasePrice: 4500.00,
    saleOrDeathDate: null,
    salePrice: null,
    farmId: 1,
  },
  {
    animalId: 2,
    eartagId: 'PL005987654321',
    breed: 'Simental',
    gender: 'Samiec',
    age: 2,
    weight: 480,
    purchaseOrBirthDate: '2024-01-10',
    purchasePrice: 3800.00,
    saleOrDeathDate: null,
    salePrice: null,
    farmId: 1,
  },
  {
    animalId: 3,
    eartagId: 'PL005111222333',
    breed: 'Limousin',
    gender: 'Samica',
    age: 3,
    weight: 550,
    purchaseOrBirthDate: '2023-06-20',
    purchasePrice: 5200.00,
    saleOrDeathDate: null,
    salePrice: null,
    farmId: 1,
  },
  {
    animalId: 4,
    eartagId: 'PL005444555666',
    breed: 'Charolaise',
    gender: 'Samiec',
    age: 1,
    weight: 320,
    purchaseOrBirthDate: '2025-02-05',
    purchasePrice: null,
    saleOrDeathDate: null,
    salePrice: null,
    farmId: 1,
  },
  {
    animalId: 5,
    eartagId: 'PL005777888999',
    breed: 'Polska czerwona',
    gender: 'Samica',
    age: 5,
    weight: 590,
    purchaseOrBirthDate: '2021-09-12',
    purchasePrice: 3200.00,
    saleOrDeathDate: null,
    salePrice: null,
    farmId: 1,
  },
];

/* Store responsible for animal data in the application.
   Central access point for the animal list for all components.
   Handles three view states: loading, success, error. */

let nextId = 6;

const useAnimalStore = create((set, get) => ({
  animals: [],
  selectedAnimal: null,
  isLoading: false,
  error: null,

  /* Fetch entire animal list */
  fetchAll: async () => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const current = get().animals;
      if (current.length === 0) {
        set({ animals: [...DEMO_ANIMALS], isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return;
    }
  },

  /* Fetch a single animal by ID */
  fetchById: async (id) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const list = get().animals.length > 0 ? get().animals : DEMO_ANIMALS;
      const found = list.find((z) => z.animalId === id);
      if (found) {
        set({ selectedAnimal: found, isLoading: false });
      } else {
        set({ error: 'Nie znaleziono zwierzecia o podanym ID', isLoading: false });
      }
      return;
    }
  },

  /* Add a new animal */
  add: async (data) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newAnimal = { ...data, animalId: nextId++ };
      set((state) => ({
        animals: [...state.animals, newAnimal],
        isLoading: false,
      }));
      return true;
    }

    return false;
  },

  /* Update animal data */
  update: async (id, data) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set((state) => ({
        animals: state.animals.map((z) =>
          z.animalId === id ? { ...z, ...data } : z
        ),
        isLoading: false,
      }));
      return true;
    }

    return false;
  },

  /* Remove an animal */
  remove: async (id) => {
    set({ isLoading: true, error: null });

    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        animals: state.animals.filter((z) => z.animalId !== id),
        isLoading: false,
      }));
      return true;
    }

    return false;
  },

  clearSelected: () => set({ selectedAnimal: null }),
  clearError: () => set({ error: null }),
}));

export default useAnimalStore;