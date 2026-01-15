import { DateTime } from 'luxon';
import { dateFormat } from 'src/lib/intlFormat';
import type { LandingSalaryCalculationsQuery } from './NewSalaryCalculationLanding/LandingSalaryCalculations.generated';

export interface CalculationDates {
  requestedOn: string;
  processedOn: string;
}

type CalculationWithDates = Pick<
  NonNullable<LandingSalaryCalculationsQuery['latestCalculation']>,
  'submittedAt' | 'changesRequestedAt'
>;

export const formatCalculationDates = (
  calculation: CalculationWithDates | null,
  locale: string,
): CalculationDates => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = DateTime.fromISO(dateString);
    return date.isValid ? dateFormat(date, locale) : 'N/A';
  };
  return {
    requestedOn: formatDate(calculation?.submittedAt),
    processedOn: formatDate(calculation?.changesRequestedAt),
  };
};
