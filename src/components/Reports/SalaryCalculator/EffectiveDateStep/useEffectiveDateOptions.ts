import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormat } from 'src/lib/intlFormat';
import { usePayrollDatesQuery } from './PayrollDates.generated';

export interface DateOption {
  value: string;
  label: string;
}

export const formatEffectiveDates = (
  effectiveDates: string[] | undefined,
  locale: string,
): DateOption[] => {
  if (!effectiveDates) {
    return [];
  }

  return effectiveDates.map((dateString: string) => {
    const date = DateTime.fromISO(dateString);
    const formattedDate = dateFormat(date, locale);

    return {
      value: dateString,
      label: formattedDate,
    };
  });
};

export const useEffectiveDateOptions = (): DateOption[] => {
  const { data } = usePayrollDatesQuery();
  const locale = useLocale();

  return useMemo(() => {
    const effectiveDates = data?.payrollDates.map(
      (payrollDate) => payrollDate.regularProcessDate,
    );

    const uniqueDates = effectiveDates
      ? Array.from(new Set(effectiveDates))
      : undefined;

    return formatEffectiveDates(uniqueDates, locale);
  }, [data?.payrollDates, locale]);
};
