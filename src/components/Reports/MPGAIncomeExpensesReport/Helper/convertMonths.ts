import { DateTime } from 'luxon';

export const convertMonths = (month: string, locale: string) => {
  const date = DateTime.fromFormat(month, 'MMM yyyy', { locale }).toISODate();

  if (!date) {
    throw new Error(`Invalid month format: ${month}`);
  }
  return date;
};
