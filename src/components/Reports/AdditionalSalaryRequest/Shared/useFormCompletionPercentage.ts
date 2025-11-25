import { useMemo } from 'react';
import { CompleteFormValues } from '../CompleteForm/CompleteForm';

export const useFormCompletionPercentage = (
  values: CompleteFormValues,
): number => {
  return useMemo(() => {
    // Get all fields except defaultPercentage (checkbox doesn't count toward completion)
    const fields = Object.entries(values).filter(
      ([key]) => key !== 'defaultPercentage',
    );

    const totalFields = fields.length;

    const filledFields = fields.filter(([, value]) => {
      const numValue = Number(value || 0);
      return numValue > 0;
    }).length;

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  }, [values]);
};
