import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18next
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    nsSeparator: false,
    keySeparator: false,
    fallbackLng: 'en',
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['navigator', 'htmlTag'],
    },
    backend: {
      loadPath: '../../locales/{{lng}}/translation.json',
    },
  });

export default i18next;
