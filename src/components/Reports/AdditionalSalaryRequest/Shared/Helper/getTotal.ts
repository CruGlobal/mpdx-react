import { CompleteFormValues } from '../../AdditionalSalaryRequest';

export const getTotal = (values: CompleteFormValues): number => {
  // Calculate total excluding the deductTwelvePercent boolean and phoneNumber string
  const total = Object.entries(values).reduce((sum, [key, val]) => {
    if (key === 'deductTwelvePercent' || key === 'phoneNumber') {
      return sum;
    }
    return sum + Number(val || 0);
  }, 0);
  return total;
};
