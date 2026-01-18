import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { KanjiGameProvider } from './contexts/GameContextKanji';
import { VocabularyGameProvider } from './contexts/GameContextVocabulary';
import { I18nProvider } from './contexts/I18nContext';
import { PreferencesProvider, usePreferences } from './contexts/PreferencesContext';


// Get Google OAuth Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function I18nWrapper({ children }) {
  const { language } = usePreferences();
  return <I18nProvider language={language}>{children}</I18nProvider>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <PreferencesProvider>
          <I18nWrapper>
            <GameProvider>
              <VocabularyGameProvider>
                <KanjiGameProvider>
                  <App />
                </KanjiGameProvider>
              </VocabularyGameProvider>
            </GameProvider>
          </I18nWrapper>
        </PreferencesProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

