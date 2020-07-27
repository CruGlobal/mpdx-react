import { isFinite, isNil } from 'lodash/fp';

const getLanguage = (): string => {
    const language = (typeof window !== 'undefined' && window.navigator.language) || 'en-US';
    return language;
};

export const numberFormat = (value: number, language = getLanguage()): string =>
    new Intl.NumberFormat(language, {
        style: 'decimal',
    }).format(isFinite(value) ? value : 0);

export const percentageFormat = (value: number, language = getLanguage()): string =>
    new Intl.NumberFormat(language, {
        style: 'percent',
    }).format(isFinite(value) ? value : 0);

export const currencyFormat = (
    value: number,
    currency: string,
    minimumFractionDigits = 0,
    language = getLanguage(),
): string =>
    new Intl.NumberFormat(language, {
        style: 'currency',
        currency: isNil(currency) ? 'USD' : currency,
        minimumFractionDigits,
    }).format(isFinite(value) ? parseFloat(value.toFixed(minimumFractionDigits)) : 0);

export const dayMonthFormat = (day: number, month: number, language = getLanguage()): string =>
    new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'short',
    }).format(new Date(new Date().getFullYear(), month, day));

const intlFormat = { numberFormat, percentageFormat, currencyFormat, dayMonthFormat };

export default intlFormat;
