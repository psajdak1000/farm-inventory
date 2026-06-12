/* ============================================
   Formatting functions
   ============================================ */

/* Format a date to a readable Polish format */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/* Format an amount with PLN currency */
export function formatAmount(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(value);
}

/* ============================================
   Analytics helper functions
   ============================================ */

/* Send a custom event to Google Analytics.
   Fulfills the requirement for at least one custom event from the requirements document. */
export function sendGAEvent(actionName, params = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', actionName, params);
  }
}

/* ============================================
   Role label mapping
   ============================================ */

export const ROLES = {
  Wlasciciel: 'Wlasciciel gospodarstwa',
  Lekarz: 'Lekarz weterynarii',
  Administrator: 'Administrator systemu',
  Admin: 'Administrator systemu',
};

export function getRoleLabel(role) {
  return ROLES[role] || role || 'Nieznana rola';
}
