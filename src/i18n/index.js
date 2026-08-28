import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ms from './ms.json'

const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('ea-lang') || 'en' : 'en'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ms: { translation: ms },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('ea-lang', lng)
})

export default i18n
