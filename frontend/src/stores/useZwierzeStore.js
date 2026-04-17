import { create } from 'zustand';

/* Flaga trybu demo — dane testowe zamiast zapytan do API.
   Po podlaczeniu backendu zmienic na false i odkomentowac import serwisu. */
const TRYB_DEMO = true;

/* import zwierzeService from '../services/zwierzeService'; */

/* Dane testowe zwierzat */
const DEMO_ZWIERZETA = [
  {
    idZwierzecia: 1,
    identyfikatorKolczyka: 'PL005123456789',
    rasa: 'Holstein-Friesian',
    plec: 'Samica',
    wiek: 4,
    waga: 620,
    dataZakupuUrodzenia: '2022-03-15',
    cenaZakupu: 4500.00,
    dataSprzedazySmierci: null,
    cenaSprzedazy: null,
    idGospodarstwa: 1,
  },
  {
    idZwierzecia: 2,
    identyfikatorKolczyka: 'PL005987654321',
    rasa: 'Simental',
    plec: 'Samiec',
    wiek: 2,
    waga: 480,
    dataZakupuUrodzenia: '2024-01-10',
    cenaZakupu: 3800.00,
    dataSprzedazySmierci: null,
    cenaSprzedazy: null,
    idGospodarstwa: 1,
  },
  {
    idZwierzecia: 3,
    identyfikatorKolczyka: 'PL005111222333',
    rasa: 'Limousin',
    plec: 'Samica',
    wiek: 3,
    waga: 550,
    dataZakupuUrodzenia: '2023-06-20',
    cenaZakupu: 5200.00,
    dataSprzedazySmierci: null,
    cenaSprzedazy: null,
    idGospodarstwa: 1,
  },
  {
    idZwierzecia: 4,
    identyfikatorKolczyka: 'PL005444555666',
    rasa: 'Charolaise',
    plec: 'Samiec',
    wiek: 1,
    waga: 320,
    dataZakupuUrodzenia: '2025-02-05',
    cenaZakupu: null,
    dataSprzedazySmierci: null,
    cenaSprzedazy: null,
    idGospodarstwa: 1,
  },
  {
    idZwierzecia: 5,
    identyfikatorKolczyka: 'PL005777888999',
    rasa: 'Polska czerwona',
    plec: 'Samica',
    wiek: 5,
    waga: 590,
    dataZakupuUrodzenia: '2021-09-12',
    cenaZakupu: 3200.00,
    dataSprzedazySmierci: null,
    cenaSprzedazy: null,
    idGospodarstwa: 1,
  },
];

/* Store odpowiedzialny za dane zwierzat w aplikacji.
   Centralny punkt dostepu do listy zwierzat dla wszystkich komponentow.
   Obsluguje trzy stany widoku: ladowanie, sukces, blad. */

let nastepneId = 6;

const useZwierzeStore = create((set, get) => ({
  zwierzeta: [],
  wybraneZwierze: null,
  ladowanie: false,
  blad: null,

  /* Pobranie calej listy zwierzat */
  pobierzWszystkie: async () => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const aktualne = get().zwierzeta;
      if (aktualne.length === 0) {
        set({ zwierzeta: [...DEMO_ZWIERZETA], ladowanie: false });
      } else {
        set({ ladowanie: false });
      }
      return;
    }
  },

  /* Pobranie szczegolowe pojedynczego zwierzecia */
  pobierzPoId: async (id) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const lista = get().zwierzeta.length > 0 ? get().zwierzeta : DEMO_ZWIERZETA;
      const znalezione = lista.find((z) => z.idZwierzecia === id);
      if (znalezione) {
        set({ wybraneZwierze: znalezione, ladowanie: false });
      } else {
        set({ blad: 'Nie znaleziono zwierzecia o podanym ID', ladowanie: false });
      }
      return;
    }
  },

  /* Dodanie nowego zwierzecia */
  dodaj: async (dane) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const nowe = { ...dane, idZwierzecia: nastepneId++ };
      set((state) => ({
        zwierzeta: [...state.zwierzeta, nowe],
        ladowanie: false,
      }));
      return true;
    }

    return false;
  },

  /* Aktualizacja danych zwierzecia */
  aktualizuj: async (id, dane) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set((state) => ({
        zwierzeta: state.zwierzeta.map((z) =>
          z.idZwierzecia === id ? { ...z, ...dane } : z
        ),
        ladowanie: false,
      }));
      return true;
    }

    return false;
  },

  /* Usuniecie zwierzecia */
  usun: async (id) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      set((state) => ({
        zwierzeta: state.zwierzeta.filter((z) => z.idZwierzecia !== id),
        ladowanie: false,
      }));
      return true;
    }

    return false;
  },

  wyczyscWybrane: () => set({ wybraneZwierze: null }),
  wyczyscBlad: () => set({ blad: null }),
}));

export default useZwierzeStore;
