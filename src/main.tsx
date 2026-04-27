import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { hydrateAppStore } from './store/appStore';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

const initialUrl = new URL(window.location.href).searchParams.get('url');

void hydrateAppStore(initialUrl);

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
