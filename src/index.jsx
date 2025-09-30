import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './contexts/GameContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GameProvider>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </GameProvider>
  </React.StrictMode>
);

