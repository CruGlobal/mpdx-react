import { useCallback } from 'react';
import { usePdsGoalCalculator } from 'src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorContext';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { useUpdatePdsGoalCalculationMutation } from '../../GoalsList/PdsGoalCalculations.generated';

export const useSaveField = () => {
  const { calculation } = usePdsGoalCalculator();
  const [updatePdsGoalCalculation] = useUpdatePdsGoalCalculationMutation();

  const saveField = useCallback(
    async (attributes: Partial<DesignationSupportCalculationUpdateInput>) => {
      if (!calculation) {
        return;
      }

      const unchanged = Object.keys(attributes).every(
        (key) => calculation[key] === attributes[key],
      );
      if (unchanged) {
        return;
      }

      return updatePdsGoalCalculation({
        variables: {
          attributes: {
            id: calculation.id,
            ...attributes,
          },
        },
        optimisticResponse: {
          updateDesignationSupportCalculation: {
            __typename: 'DesignationSupportCalculationUpdateMutationPayload',
            designationSupportCalculation: {
              ...calculation,
              ...attributes,
            },
          },
        },
      });
    },
    [calculation, updatePdsGoalCalculation],
  );

  return saveField;
};
