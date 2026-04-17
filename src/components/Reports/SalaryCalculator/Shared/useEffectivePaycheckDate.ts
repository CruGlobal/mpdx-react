import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useLocale } from 'src/hooks/useLocale';
import { dateFormatShort } from 'src/lib/intlFormat';
import { usePayrollDatesQuery } from '../EffectiveDateStep/PayrollDates.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export const useEffectivePaycheckDate = (): string | null => {
  const { calculation } = useSalaryCalculator();
  const { data } = usePayrollDatesQuery();
  const locale = useLocale();

  return useMemo(() => {
    if (!calculation?.effectiveDate || !data?.payrollDates) {
      return null;
    }

    const payrollDate = data.payrollDates.find(
      (entry) => entry.startDate === calculation.effectiveDate,
    );

    return payrollDate
      ? dateFormatShort(
          DateTime.fromISO(payrollDate.regularProcessDate),
          locale,
        )
      : null;
  }, [calculation?.effectiveDate, data?.payrollDates, locale]);
};
