import { useMemo } from 'react';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { useGoalCalculationQuery } from './GoalCalculation.generated';
import { getPrimaryTotal, getSubTotal } from './Helpers/helpers';
import { MinistryExpenses } from './MpdGoal/MpdGoalTable';

export const useReportExpenses = (
  accountListId: string,
  goalCalculationId: string,
) => {
  const { data: goalData, loading } = useGoalCalculationQuery({
    variables: {
      accountListId,
      goalCalculationId,
    },
  });
  const expenses: MinistryExpenses | null = useMemo(() => {
    if (!goalData?.goalCalculation) {
      return null;
    }
    const ministryFamily = goalData.goalCalculation.ministryFamily;
    return {
      benefitsCharge: 0,
      ministryMileage: getSubTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        'MINISTRY_MILEAGE',
      ),
      medicalMileage: getSubTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.MinistryAndMedicalMileage,
        'MEDICAL_MILEAGE',
      ),
      medicalExpenses: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.Medical,
      ),
      ministryPartnerDevelopment: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
      ),
      communications: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.Utilities,
      ),
      entertainment: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.Recreation,
      ),
      staffDevelopment: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.MinistryPartnerDevelopment,
      ),
      supplies: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.SuppliesAndMaterials,
      ),
      technology:
        getPrimaryTotal(
          ministryFamily,
          PrimaryBudgetCategoryEnum.InternetServiceProviderFee,
        ) +
        getPrimaryTotal(
          ministryFamily,
          PrimaryBudgetCategoryEnum.CellPhoneWorkLine,
        ),
      travel:
        getPrimaryTotal(
          ministryFamily,
          PrimaryBudgetCategoryEnum.MinistryTravel,
        ) +
        getPrimaryTotal(
          ministryFamily,
          PrimaryBudgetCategoryEnum.SummerAssignmentTravel,
        ),
      transfers: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.AccountTransfers,
      ),
      other: getPrimaryTotal(
        ministryFamily,
        PrimaryBudgetCategoryEnum.MinistryOther,
      ),
    };
  }, [goalData]);

  return {
    expenses,
    loading,
  };
};
