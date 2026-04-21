import { useCallback } from 'react';
import { usePdsGoalCalculator } from 'src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorContext';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { useUpdatePdsGoalCalculationMutation } from '../../GoalsList/PdsGoalCalculations.generated';
import { calculateReimbursableTotals } from '../../calculations/reimbursableExpenses';
import { calculateSalaryTotals } from '../../calculations/salaryCalculation';

export const useSaveField = () => {
  const { calculation, constants, trackMutation } = usePdsGoalCalculator();
  const { reimbursableFloor, employerFicaRate, geographicMultipliers } =
    constants;
  const [updatePdsGoalCalculation] = useUpdatePdsGoalCalculationMutation();

  const saveField = useCallback(
    async (attributes: Partial<DesignationSupportCalculationUpdateInput>) => {
      if (!calculation) {
        return;
      }

      const merged = { ...calculation, ...attributes };
      const derived: {
        totalReimbursableExpenses?: number;
        totalMonthlySupportGoal?: number;
      } = {};

      if (reimbursableFloor !== undefined) {
        derived.totalReimbursableExpenses = calculateReimbursableTotals(
          merged,
          reimbursableFloor,
        ).total;
      }

      if (employerFicaRate !== undefined) {
        const geographicMultiplier =
          geographicMultipliers.get(merged.geographicLocation ?? '') ?? 0;
        derived.totalMonthlySupportGoal = calculateSalaryTotals(merged, {
          geographicMultiplier,
          employerFicaRate,
        }).subtotal;
      }

      const payload = { ...attributes, ...derived };

      const unchanged = Object.keys(payload).every(
        (key) => calculation[key] === payload[key],
      );
      if (unchanged) {
        return;
      }

      return trackMutation(
        updatePdsGoalCalculation({
          variables: {
            attributes: {
              id: calculation.id,
              ...payload,
            },
          },
          optimisticResponse: {
            updateDesignationSupportCalculation: {
              __typename: 'DesignationSupportCalculationUpdateMutationPayload',
              designationSupportCalculation: {
                __typename: 'DesignationSupportCalculation',
                ...calculation,
                ...payload,
                totalReimbursableExpenses:
                  derived.totalReimbursableExpenses ??
                  calculation.totalReimbursableExpenses,
                totalMonthlySupportGoal:
                  derived.totalMonthlySupportGoal ??
                  calculation.totalMonthlySupportGoal,
              },
            },
          },
        }),
      );
    },
    [
      calculation,
      reimbursableFloor,
      employerFicaRate,
      geographicMultipliers,
      trackMutation,
      updatePdsGoalCalculation,
    ],
  );

  return saveField;
};
