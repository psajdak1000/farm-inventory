import { create } from 'zustand';

const TRYB_DEMO = true;

/* Dane testowe zabiegow */
const DEMO_ZABIEGI = [
  {
    idZabiegu: 1,
    nazwa: 'Szczepienie profilaktyczne',
    dataZabiegu: '2026-01-20',
    opis: 'Szczepienie przeciwko IBR/BVD',
    koszt: 120.00,
    idZwierzecia: 1,
    idLekarza: 1,
  },
  {
    idZabiegu: 2,
    nazwa: 'Odrobaczanie',
    dataZabiegu: '2026-02-15',
    opis: 'Podanie preparatu przeciwpasozytniczego',
    koszt: 85.00,
    idZwierzecia: 2,
    idLekarza: 1,
  },
  {
    idZabiegu: 3,
    nazwa: 'Korekcja racic',
    dataZabiegu: '2026-03-01',
    opis: 'Przycinanie i korekcja racic — rutynowy zabieg',
    koszt: 150.00,
    idZwierzecia: 3,
    idLekarza: 1,
  },
];

let nastepneId = 4;

const useZabiegStore = create((set, get) => ({
  zabiegi: [],
  wybranyZabieg: null,
  ladowanie: false,
  blad: null,

  pobierzWszystkie: async () => {
    set({ ladowanie: true, blad: null });
    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const aktualne = get().zabiegi;
      if (aktualne.length === 0) {
        set({ zabiegi: [...DEMO_ZABIEGI], ladowanie: false });
      } else {
        set({ ladowanie: false });
      }
      return;
    }
  },

  dodaj: async (dane) => {
    set({ ladowanie: true, blad: null });
    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const nowy = { ...dane, idZabiegu: nastepneId++ };
      set((state) => ({
        zabiegi: [...state.zabiegi, nowy],
        ladowanie: false,
      }));
      return true;
    }
    return false;
  },

  usun: async (id) => {
    set({ ladowanie: true, blad: null });
    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        zabiegi: state.zabiegi.filter((z) => z.idZabiegu !== id),
        ladowanie: false,
      }));
      return true;
    }
    return false;
  },

  wyczyscBlad: () => set({ blad: null }),
}));

export default useZabiegStore;
