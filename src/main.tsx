import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Offline support when served as a normal site (not inside sandboxed frames).
if ('serviceWorker' in navigator && window.isSecureContext && !import.meta.env.DEV && import.meta.env.MODE !== 'single') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
