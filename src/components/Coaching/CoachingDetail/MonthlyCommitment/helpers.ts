import { DateTime } from 'luxon';

export const formatStartDate = (
  startDate: string | null | undefined,
  locale: string,
): string => {
  if (!startDate) {
    return '';
  }

  return DateTime.fromISO(startDate).toJSDate().toLocaleDateString(locale, {
    month: 'short',
    year: '2-digit',
  });
};
