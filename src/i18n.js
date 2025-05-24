import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

const resources = {
  french: {
    translation: translations.french
  },
  creole: {
    translation: translations.creole
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'french',
    fallbackLng: 'creole',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    },
    debug: process.env.NODE_ENV === 'development',
    returnNull: false,
    returnEmptyString: false,
    keySeparator: '.',
    initImmediate: true,
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 