import { createContext, useContext, useMemo } from 'react'
import frTranslations from '../i18n/fr.json'
import enTranslations from '../i18n/en.json'
import { LANGUAGES } from '../constants'


const I18nContext = createContext()

const translations = {
  fr: frTranslations,
  en: enTranslations,
}

export function I18nProvider({ children, language = LANGUAGES.FR }) {
  const currentTranslations = translations[language] || translations.fr

  const t = useMemo(() => (key) => {
    const keys = key.split('.')
    let value = currentTranslations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    return value
  }, [currentTranslations])

  const value = useMemo(() => ({
    language,
    t,
  }), [language, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider')
  }
  return context
}
