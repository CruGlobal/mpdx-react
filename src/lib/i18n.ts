import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { currencyFormat, numberFormat } from './intlFormat';

i18next
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    nsSeparator: false,
    keySeparator: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      format: (value, format, language = 'en-US'): string => {
        switch (format) {
          case 'number':
            return numberFormat(value, language);
          case 'currency':
            return currencyFormat(value.amount, value.currency, language);
          default:
            return value;
        }
      },
    },
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
