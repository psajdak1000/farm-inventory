import { create } from 'zustand';

const DEMO_MODE = true;

/* Test data for feedings */
const DEMO_FEEDINGS = [
  {
    feedingId: 1,
    name: 'Siano lucernowe',
    type: 'Sucha',
    quantity: '200 kg',
    price: 450.00,
    purchaseDate: '2026-01-15',
    animalId: 1,
  },
  {
    feedingId: 2,
    name: 'Kiszonka z kukurydzy',
    type: 'Mokra',
    quantity: '500 kg',
    price: 320.00,
    purchaseDate: '2026-02-01',
    animalId: 2,
  },
  {
    feedingId: 3,
    name: 'Pasza treściwa',
    type: 'Koncentrat',
    quantity: '100 kg',
    price: 280.00,
    purchaseDate: '2026-02-10',
    animalId: 1,
  },
  {
    feedingId: 4,
    name: 'Sianokiszonka',
    type: 'Mokra',
    quantity: '300 kg',
    price: 180.00,
    purchaseDate: '2026-03-05',
    animalId: 3,
  },
];

let nextId = 5;

const useFeedingStore = create((set, get) => ({
  feedings: [],
  selectedFeeding: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const current = get().feedings;
      if (current.length === 0) {
        set({ feedings: [...DEMO_FEEDINGS], isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return;
    }
  },

  add: async (data) => {
    set({ isLoading: true, error: null });
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const newFeeding = { ...data, feedingId: nextId++ };
      set((state) => ({
        feedings: [...state.feedings, newFeeding],
        isLoading: false,
      }));
      return true;
    }
    return false;
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        feedings: state.feedings.filter((k) => k.feedingId !== id),
        isLoading: false,
      }));
      return true;
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));

export default useFeedingStore;