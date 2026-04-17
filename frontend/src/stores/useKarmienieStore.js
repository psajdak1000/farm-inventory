import { create } from 'zustand';

const TRYB_DEMO = true;

/* Dane testowe karmien */
const DEMO_KARMIENIA = [
  {
    idKarmienia: 1,
    nazwa: 'Siano lucernowe',
    rodzaj: 'Sucha',
    ilosc: '200 kg',
    cena: 450.00,
    dataZakupu: '2026-01-15',
    idZwierzecia: 1,
  },
  {
    idKarmienia: 2,
    nazwa: 'Kiszonka z kukurydzy',
    rodzaj: 'Mokra',
    ilosc: '500 kg',
    cena: 320.00,
    dataZakupu: '2026-02-01',
    idZwierzecia: 2,
  },
  {
    idKarmienia: 3,
    nazwa: 'Pasza treściwa',
    rodzaj: 'Koncentrat',
    ilosc: '100 kg',
    cena: 280.00,
    dataZakupu: '2026-02-10',
    idZwierzecia: 1,
  },
  {
    idKarmienia: 4,
    nazwa: 'Sianokiszonka',
    rodzaj: 'Mokra',
    ilosc: '300 kg',
    cena: 180.00,
    dataZakupu: '2026-03-05',
    idZwierzecia: 3,
  },
];

let nastepneId = 5;

const useKarmienieStore = create((set, get) => ({
  karmienia: [],
  wybraneKarmienie: null,
  ladowanie: false,
  blad: null,

  pobierzWszystkie: async () => {
    set({ ladowanie: true, blad: null });
    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const aktualne = get().karmienia;
      if (aktualne.length === 0) {
        set({ karmienia: [...DEMO_KARMIENIA], ladowanie: false });
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
      const nowe = { ...dane, idKarmienia: nastepneId++ };
      set((state) => ({
        karmienia: [...state.karmienia, nowe],
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
        karmienia: state.karmienia.filter((k) => k.idKarmienia !== id),
        ladowanie: false,
      }));
      return true;
    }
    return false;
  },

  wyczyscBlad: () => set({ blad: null }),
}));

export default useKarmienieStore;
