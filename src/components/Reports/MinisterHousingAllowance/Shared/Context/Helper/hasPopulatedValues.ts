import { MhaRequestAttributes } from 'src/graphql/types.generated';

export const hasPopulatedValues = (
  requestAttributes: MhaRequestAttributes | null,
): boolean => {
  if (!requestAttributes) {
    return false;
  }

  const calculationFields = [
    'rentalValue',
    'furnitureCostsOne',
    'avgUtilityOne',
    'mortgageOrRentPayment',
    'furnitureCostsTwo',
    'repairCosts',
    'avgUtilityTwo',
    'unexpectedExpenses',
    'iUnderstandMhaPolicy',
  ];

  const atLeastOneFieldPopulated = calculationFields.some((field) => {
    const value = requestAttributes[field as keyof MhaRequestAttributes];
    if (field === 'iUnderstandMhaPolicy') {
      return value === true;
    }
    return value !== null && value !== undefined;
  });

  return atLeastOneFieldPopulated;
};
