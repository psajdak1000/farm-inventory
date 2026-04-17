/* ============================================
   Funkcje formatujace
   ============================================ */

/* Formatowanie daty do czytelnego formatu polskiego */
export function formatujDate(dataISO) {
  if (!dataISO) return '—';
  const data = new Date(dataISO);
  return data.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/* Formatowanie kwoty z waluta PLN */
export function formatujKwote(wartosc) {
  if (wartosc === null || wartosc === undefined) return '—';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(wartosc);
}

/* ============================================
   Funkcje pomocnicze dla analityki
   ============================================ */

/* Wysylanie zdarzenia niestandardowego do Google Analytics.
   Spelnia wymaganie minimum jednego custom event z dokumentu wymagan. */
export function wyslijZdarzenieGA(nazwaAkcji, parametry = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', nazwaAkcji, parametry);
  }
}

/* ============================================
   Mapowanie rol na etykiety
   ============================================ */

export const ROLE = {
  Wlasciciel: 'Wlasciciel gospodarstwa',
  Lekarz: 'Lekarz weterynarii',
  Administrator: 'Administrator systemu',
};

export function pobierzEtykieteRoli(rola) {
  return ROLE[rola] || rola || 'Nieznana rola';
}
