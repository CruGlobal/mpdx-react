import { CompleteFormValues } from '../AdditionalSalaryRequest';

export const calculateCompletionPercentage = (
  values: CompleteFormValues,
  currentIndex: number,
  totalSteps: number,
): number => {
  const fields = Object.values(values).filter(
    (value) => typeof value === 'string' || typeof value === 'number',
  );
  const index = currentIndex + 1;
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

  return totalFields > 0
    ? Math.round(((index + filledFields) / (totalSteps + totalFields)) * 100)
    : 0;
};
