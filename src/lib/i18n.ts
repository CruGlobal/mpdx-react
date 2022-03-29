import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { currencyFormat, numberFormat } from './intlFormat';
import * as english from 'public/locales/en/translation.json';

i18next
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    lng: 'en',
    nsSeparator: false,
    keySeparator: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
      format: (value, format): string => {
        switch (format) {
          case 'number':
            return numberFormat(value);
          case 'currency':
            return currencyFormat(value.amount, value.currency);
          default:
            return value;
        }
      },
    },
    react: {
      wait: true,
      useSuspense: false,
    },
    resources: {
      en: {
        translation: english,
      },
    },
  });

export default i18next;
