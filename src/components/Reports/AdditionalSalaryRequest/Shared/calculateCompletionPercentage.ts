import { CompleteFormValues } from '../CompleteForm/CompleteForm';

export const calculateCompletionPercentage = (
  values: CompleteFormValues,
): number => {
  // Get all fields except defaultPercentage (checkbox doesn't count toward completion)
  const fields = Object.values(values).filter(
    (value) => typeof value === 'string' || typeof value === 'number',
  );

  const totalFields = fields.length;

  const filledFields = fields.filter((value) => {
    const numValue = Number(value || 0);
    return numValue > 0;
  }).length;

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
};
