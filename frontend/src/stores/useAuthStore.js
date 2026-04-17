import { create } from 'zustand';

/* Flaga trybu demo — gdy backend nie jest dostepny, logowanie
   dziala na danych lokalnych bez komunikacji z serwerem.
   Po podlaczeniu backendu wystarczy zmienic na false i odkomentowac
   import authService. */
const TRYB_DEMO = true;

/* import authService from '../services/authService'; */

/* Dane testowe uzytkownikow w trybie demo */
const DEMO_UZYTKOWNICY = {
  'jan@kowalski.pl': {
    haslo: 'Haslo123!',
    uzytkownik: { imie: 'Jan', nazwisko: 'Kowalski', email: 'jan@kowalski.pl', telefon: '123456789' },
    rola: 'Wlasciciel',
    token: 'demo-token-wlasciciel',
  },
  'anna@nowak.pl': {
    haslo: 'Haslo123!',
    uzytkownik: { imie: 'Anna', nazwisko: 'Nowak', email: 'anna@nowak.pl', telefon: '987654321' },
    rola: 'Lekarz',
    token: 'demo-token-lekarz',
  },
  'admin@system.pl': {
    haslo: 'Haslo123!',
    uzytkownik: { imie: 'Admin', nazwisko: 'Systemowy', email: 'admin@system.pl', telefon: '111222333' },
    rola: 'Administrator',
    token: 'demo-token-admin',
  },
};

/* Store odpowiedzialny za stan autoryzacji w calej aplikacji.
   Przechowuje dane zalogowanego uzytkownika, jego role oraz token.
   Zmiana stanu w tym store powoduje re-render we wszystkich komponentach,
   ktore z niego korzystaja — spelnia wymaganie reaktywnosci stanu globalnego. */

const useAuthStore = create((set) => ({
  /* Stan poczatkowy */
  uzytkownik: JSON.parse(localStorage.getItem('demoUser') || 'null'),
  token: localStorage.getItem('authToken') || null,
  rola: localStorage.getItem('userRole') || null,
  zalogowany: !!localStorage.getItem('authToken'),
  ladowanie: false,
  blad: null,

  /* Logowanie uzytkownika */
  zaloguj: async (dane) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      /* Symulacja opoznienia sieciowego */
      await new Promise((resolve) => setTimeout(resolve, 500));

      const konto = DEMO_UZYTKOWNICY[dane.email];
      if (!konto || konto.haslo !== dane.password) {
        set({
          blad: 'Nieprawidlowy email lub haslo. Uzyj jednego z kont demo (szczegoly na stronie logowania).',
          ladowanie: false,
        });
        return false;
      }

      localStorage.setItem('authToken', konto.token);
      localStorage.setItem('userRole', konto.rola);
      localStorage.setItem('demoUser', JSON.stringify(konto.uzytkownik));
      set({
        uzytkownik: konto.uzytkownik,
        token: konto.token,
        rola: konto.rola,
        zalogowany: true,
        ladowanie: false,
      });
      return true;
    }

    /* Logowanie przez API — aktywne gdy TRYB_DEMO = false */
    /* try {
      const odpowiedz = await authService.login(dane);
      localStorage.setItem('authToken', odpowiedz.token);
      localStorage.setItem('userRole', odpowiedz.rola);
      set({
        uzytkownik: odpowiedz.uzytkownik,
        token: odpowiedz.token,
        rola: odpowiedz.rola,
        zalogowany: true,
        ladowanie: false,
      });
      return true;
    } catch (error) {
      set({
        blad: error.response?.data?.message || 'Nie udalo sie zalogowac',
        ladowanie: false,
      });
      return false;
    } */
    return false;
  },

  /* Rejestracja nowego uzytkownika */
  zarejestruj: async (dane) => {
    set({ ladowanie: true, blad: null });

    if (TRYB_DEMO) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const nowyUzytkownik = {
        imie: 'Nowy',
        nazwisko: 'Uzytkownik',
        email: dane.email,
        telefon: '000000000',
      };
      const rola = dane.typKonta || 'Wlasciciel';
      const token = 'demo-token-nowy';

      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', rola);
      localStorage.setItem('demoUser', JSON.stringify(nowyUzytkownik));
      set({
        uzytkownik: nowyUzytkownik,
        token: token,
        rola: rola,
        zalogowany: true,
        ladowanie: false,
      });
      return true;
    }

    return false;
  },

  /* Wylogowanie */
  wyloguj: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('demoUser');
    set({
      uzytkownik: null,
      token: null,
      rola: null,
      zalogowany: false,
      blad: null,
    });
  },

  /* Czyszczenie komunikatu o bledzie */
  wyczyscBlad: () => set({ blad: null }),
}));

export default useAuthStore;
