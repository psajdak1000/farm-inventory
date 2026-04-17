import { BrowserRouter } from 'react-router-dom';
import AppContent from './AppContent';

/* App — punkt wejscia konfiguracji routingu.
   BrowserRouter jest opakowaniem dla calej nawigacji SPA.
   Komponent AppContent zawiera definicje tras i hook sledzenia analityki. */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
