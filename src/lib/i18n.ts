import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

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
