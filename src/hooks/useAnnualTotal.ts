import { useMemo } from 'react';
import { CalculationFormValues } from 'src/components/Reports/MinisterHousingAllowance/Steps/StepThree/Calculation';
import { MhaRentOrOwnEnum } from 'src/graphql/types.generated';

export const calculateAnnualTotals = (
  values: CalculationFormValues,
  rentOrOwn?: MhaRentOrOwnEnum,
) => {
  const {
    rentalValue,
    furnitureCostsOne,
    avgUtilityOne,
    mortgageOrRentPayment,
    furnitureCostsTwo,
    repairCosts,
    avgUtilityTwo,
    unexpectedExpenses,
  } = values;

  const totalFairRental =
    rentOrOwn === MhaRentOrOwnEnum.Own
      ? (rentalValue ?? 0) + (furnitureCostsOne ?? 0) + (avgUtilityOne ?? 0)
      : 0;

  const annualFairRental = totalFairRental * 12;

  const totalCostOfHome =
    (mortgageOrRentPayment ?? 0) +
    (furnitureCostsTwo ?? 0) +
    (repairCosts ?? 0) +
    (avgUtilityTwo ?? 0) +
    (unexpectedExpenses ?? 0);

  const annualCostOfHome = totalCostOfHome * 12;

  const annualTotal =
    annualFairRental === 0
      ? annualCostOfHome
      : annualCostOfHome === 0
        ? annualFairRental
        : Math.min(annualFairRental, annualCostOfHome);

  return {
    annualTotal,
    totalFairRental,
    annualFairRental,
    totalCostOfHome,
    annualCostOfHome,
  };
};

export const useAnnualTotal = (
  values: CalculationFormValues,
  rentOrOwn?: MhaRentOrOwnEnum,
) => {
  return useMemo(
    () => calculateAnnualTotals(values, rentOrOwn),
    [
      rentOrOwn,
      values.rentalValue,
      values.furnitureCostsOne,
      values.avgUtilityOne,
      values.mortgageOrRentPayment,
      values.furnitureCostsTwo,
      values.repairCosts,
      values.avgUtilityTwo,
      values.unexpectedExpenses,
    ],
  );
};
