import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

/* usePageTracking — hook rejestrujacy kazda zmiane sciezki URL w Google Analytics.
   Spelnia wymaganie sledzenia odslon stron (page views) z dokumentu wymagan.
   Nalezy umiescic go w komponencie opakowujacym cala aplikacje (np. App). */

function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: 'pageview',
      page: location.pathname + location.search,
    });
  }, [location]);
}

export default usePageTracking;
