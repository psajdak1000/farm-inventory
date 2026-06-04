import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import ReactGA from 'react-ga4';
import App from './App';
import './styles/global.css';

/* ============================================
   Inicjalizacja Sentry — monitorowanie bledow (ocena 5)
   DSN nalezy uzupelnic po utworzeniu projektu w panelu Sentry.
   ============================================ */
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

/* ============================================
   Inicjalizacja Google Analytics 4 — analityka (ocena 5)
   Measurement ID nalezy uzupelnic po utworzeniu uslugi w GA4.
   ============================================ */
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
if (GA_MEASUREMENT_ID) {
  ReactGA.initialize(GA_MEASUREMENT_ID);
}

/* ============================================
   Punkt wejscia aplikacji
   ============================================ */
const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Wystapil nieoczekiwany blad</h2>
          <p>Przepraszamy za niedogodnosci. Sprobuj odswiezyc strone.</p>
          <button onClick={() => window.location.reload()}>
            Odswiez strone
          </button>
        </div>
      }
    >
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
