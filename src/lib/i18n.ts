import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { numberFormat } from './intlFormat';

i18next
    .use(Backend)
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        lng: 'en',
        nsSeparator: false,
        keySeparator: false,
        fallbackLng: false,
        interpolation: {
            escapeValue: false,
            format: (value, format, lng): string => {
                switch (format) {
                    case 'number':
                        return numberFormat(value, lng);
                    default:
                        return value;
                }
            },
        },
        react: {
            wait: true,
            useSuspense: false,
        },
    });

export default i18next;
