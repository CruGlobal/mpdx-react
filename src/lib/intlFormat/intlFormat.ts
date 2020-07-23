const getLanguage = (): string => {
    const language = (typeof window !== 'undefined' && window.navigator.language) || 'en-US';
    return language;
};

export const numberFormat = (value: number, language = getLanguage()): string =>
    new Intl.NumberFormat(language, {
        style: 'decimal',
    }).format(isNaN(value) ? 0 : value);

export const percentageFormat = (value: number, language = getLanguage()): string =>
    new Intl.NumberFormat(language, {
        style: 'percent',
    }).format(isNaN(value) ? 0 : value);

export const currencyFormat = (
    value: number,
    currency: string,
    minimumFractionDigits = 0,
    language = getLanguage(),
): string =>
    new Intl.NumberFormat(language, {
        style: 'currency',
        currency,
        minimumFractionDigits,
    }).format(isNaN(value) ? 0 : parseFloat(value.toFixed(minimumFractionDigits)));

export const dayMonthFormat = (day: number, month: number, language = getLanguage()): string =>
    new Intl.DateTimeFormat(language, {
        day: 'numeric',
        month: 'short',
    }).format(new Date(new Date().getFullYear(), month, day));

const intlFormat = { numberFormat, percentageFormat, currencyFormat, dayMonthFormat };

export default intlFormat;
