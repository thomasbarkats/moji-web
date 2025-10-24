import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './contexts/GameContext';
import { PreferencesProvider, usePreferences } from './contexts/PreferencesContext';
import { KanjiGameProvider } from './contexts/GameContextKanji';
import { I18nProvider } from './contexts/I18nContext';
import './index.css';


function I18nWrapper({ children }) {
  const { language } = usePreferences();
  return <I18nProvider language={language}>{children}</I18nProvider>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PreferencesProvider>
      <I18nWrapper>
        <GameProvider>
          <KanjiGameProvider>
            <App />
          </KanjiGameProvider>
        </GameProvider>
      </I18nWrapper>
    </PreferencesProvider>
  </React.StrictMode>
);

