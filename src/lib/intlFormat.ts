export const numberFormat = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'decimal',
    }).format(value);

export const percentageFormat = (value: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'percent',
    }).format(value);

export const currencyFormat = (value: number, currency: string, minimumFractionDigits = 0): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits,
    }).format(isNaN(value) ? 0 : parseFloat(value.toFixed(minimumFractionDigits)));

export const dayMonthFormat = (day: number, month: number): string =>
    new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'long',
    }).format(new Date(new Date().getFullYear(), month - 1, day));
