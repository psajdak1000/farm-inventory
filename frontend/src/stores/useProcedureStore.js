import { create } from 'zustand';

const DEMO_MODE = true;

/* Test data for procedures */
const DEMO_PROCEDURES = [
  {
    procedureId: 1,
    name: 'Szczepienie profilaktyczne',
    procedureDate: '2026-01-20',
    description: 'Szczepienie przeciwko IBR/BVD',
    cost: 120.00,
    animalId: 1,
    veterinarianId: 1,
  },
  {
    procedureId: 2,
    name: 'Odrobaczanie',
    procedureDate: '2026-02-15',
    description: 'Podanie preparatu przeciwpasozytniczego',
    cost: 85.00,
    animalId: 2,
    veterinarianId: 1,
  },
  {
    procedureId: 3,
    name: 'Korekcja racic',
    procedureDate: '2026-03-01',
    description: 'Przycinanie i korekcja racic — rutynowy zabieg',
    cost: 150.00,
    animalId: 3,
    veterinarianId: 1,
  },
];

let nextId = 4;

const useProcedureStore = create((set, get) => ({
  procedures: [],
  selectedProcedure: null,
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const current = get().procedures;
      if (current.length === 0) {
        set({ procedures: [...DEMO_PROCEDURES], isLoading: false });
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
      const newProcedure = { ...data, procedureId: nextId++ };
      set((state) => ({
        procedures: [...state.procedures, newProcedure],
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
        procedures: state.procedures.filter((z) => z.procedureId !== id),
        isLoading: false,
      }));
      return true;
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));

export default useProcedureStore;