import { useMemo } from 'react';
import { CalculationFormValues } from 'src/components/Reports/MinisterHousingAllowance/NewRequest/Steps/StepThree/Calculation';

export const useAnnualTotal = (values: CalculationFormValues) => {
  const {
    rentalValue,
    furnitureCostsOne,
    avgUtilityOne,
    mortgagePayment,
    furnitureCostsTwo,
    repairCosts,
    avgUtilityTwo,
    unexpectedExpenses,
  } = values;

  const totalFairRental = useMemo(
    () => (rentalValue ?? 0) + (furnitureCostsOne ?? 0) + (avgUtilityOne ?? 0),
    [rentalValue, furnitureCostsOne, avgUtilityOne],
  );
  const annualFairRental = totalFairRental * 12;
  const totalCostOfHome = useMemo(
    () =>
      (mortgagePayment ?? 0) +
      (furnitureCostsTwo ?? 0) +
      (repairCosts ?? 0) +
      (avgUtilityTwo ?? 0) +
      (unexpectedExpenses ?? 0),
    [
      mortgagePayment,
      furnitureCostsTwo,
      repairCosts,
      avgUtilityTwo,
      unexpectedExpenses,
    ],
  );
  const annualCostOfHome = totalCostOfHome * 12;

  const annualTotal =
    annualFairRental === 0
      ? annualCostOfHome
      : annualCostOfHome === 0
        ? annualFairRental
        : Math.min(annualFairRental, annualCostOfHome);

  //eslint-disable-next-line no-console
  console.log({
    totalFairRental,
    annualFairRental,
    totalCostOfHome,
    annualCostOfHome,
    annualTotal,
  });

  return {
    annualTotal,
    totalFairRental,
    annualFairRental,
    totalCostOfHome,
    annualCostOfHome,
  };
};
