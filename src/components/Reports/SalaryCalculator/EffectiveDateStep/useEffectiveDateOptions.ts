import { useMemo } from 'react';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

export interface DateOption {
  value: string;
  label: string;
}

export const formatEffectiveDates = (
  effectiveDates?: string[],
): DateOption[] => {
  if (!effectiveDates) {
    return [];
  }

  return effectiveDates.map((dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return {
      value: dateString,
      label: formattedDate,
    };
  });
};

export const useEffectiveDateOptions = (): DateOption[] => {
  const { hcm } = useSalaryCalculator();

  return useMemo(() => {
    // TODO: Add effectiveDates field to HCM GraphQL query
    // @ts-expect-error - effectiveDates field doesn't exist yet in HCM type
    const effectiveDates = hcm?.effectiveDates;
    return formatEffectiveDates(effectiveDates);
    // @ts-expect-error - effectiveDates field doesn't exist yet in HCM type
  }, [hcm?.effectiveDates]);
};
