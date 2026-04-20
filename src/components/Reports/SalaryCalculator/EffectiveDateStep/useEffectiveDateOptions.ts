import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat, dateFormatShort } from 'src/lib/intlFormat';
import {
  PayrollDatesQuery,
  usePayrollDatesQuery,
} from './PayrollDates.generated';

export interface DateOption {
  value: string;
  label: string;
  shortLabel: string;
}

export const formatEffectiveDates = (
  effectiveDates: PayrollDatesQuery['payrollDates'] | undefined,
  locale: string,
): DateOption[] => {
  return (
    effectiveDates?.map(({ startDate, regularProcessDate }) => {
      const date = DateTime.fromISO(regularProcessDate);

      // The user sees the regularProcessDate, but we store the startDate
      return {
        value: startDate,
        label: dateFormat(date, locale),
        shortLabel: dateFormatShort(date, locale),
      };
    }) ?? []
  );
};

export const useEffectiveDateOptions = (): DateOption[] => {
  const { data } = usePayrollDatesQuery();
  const locale = useLocale();

  return useMemo(
    () => formatEffectiveDates(data?.payrollDates, locale),
    [data, locale],
  );
};
