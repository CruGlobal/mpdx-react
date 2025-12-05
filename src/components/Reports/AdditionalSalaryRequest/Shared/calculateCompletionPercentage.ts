import { CompleteFormValues } from '../AdditionalSalaryRequest';

export const calculateCompletionPercentage = (
  values: CompleteFormValues,
): number => {
  // Get all fields except defaultPercentage (checkbox doesn't count toward completion)
  const fields = Object.values(values).filter(
    (value) => typeof value === 'string' || typeof value === 'number',
  );

  const totalFields = fields.length;

  const filledFields = fields.filter((value) => {
    // For string values, check if it's non-empty and not just whitespace
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (trimmedValue === '' || trimmedValue === '0') {
        return false;
      }
      // For numeric strings, check if the number is > 0
      const numValue = Number(trimmedValue);
      if (!isNaN(numValue)) {
        return numValue > 0;
      }
      // For non-numeric strings (like phone numbers), just check if not empty
      return trimmedValue.length > 0;
    }
    // For number values, check if > 0
    return value > 0;
  }).length;

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
};
