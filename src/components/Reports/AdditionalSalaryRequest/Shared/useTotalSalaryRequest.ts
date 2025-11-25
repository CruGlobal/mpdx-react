import { useMemo } from 'react';
import { CompleteFormValues } from '../CompleteForm/CompleteForm';

export const useTotalSalaryRequest = (values: CompleteFormValues): number => {
  return useMemo(() => {
    return Object.entries(values).reduce((sum, [key, val]) => {
      if (key === 'defaultPercentage') {
        return sum;
      }
      return sum + Number(val || 0);
    }, 0);
  }, [values]);
};
