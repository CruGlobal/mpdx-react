import { CompleteFormValues } from '../AdditionalSalaryRequest';

export const calculateCompletionPercentage = (
  values: CompleteFormValues,
): number => {
  const fields = Object.values(values).filter(
    (value) => typeof value === 'string' || typeof value === 'number',
  );

  const totalFields = fields.length;

  const filledFields = fields.filter((value) => {
    if (typeof value === 'string') {
      const trimmedValue = value.trim();

      if (trimmedValue === '' || trimmedValue === '0') {
        return false;
      }

      const numValue = Number(trimmedValue);

      if (!isNaN(numValue)) {
        return numValue > 0;
      }

      return trimmedValue.length > 0;
    }
    return value > 0;
  }).length;

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
};
