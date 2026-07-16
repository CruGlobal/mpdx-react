import { useCallback } from 'react';
import { GoalCalculationUpdateInput } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useRestrictedImpersonation } from 'src/hooks/useRestrictedImpersonation';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { useUpdateGoalCalculationMutation } from '../SettingsCategory/GoalCalculation.generated';

export const useSaveField = () => {
  const accountListId = useAccountListId();
  const {
    goalCalculationResult: { data },
    trackMutation,
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;
  const [updateGoalCalculation] = useUpdateGoalCalculationMutation();
  const restrictedImpersonation = useRestrictedImpersonation();

  const saveField = useCallback(
    async (attributes: Partial<GoalCalculationUpdateInput>) => {
      // The tool is read-only during restricted impersonation, so autosave
      // must not fire mutations that the API would reject
      if (restrictedImpersonation || !goalCalculation) {
        return;
      }

      const unchanged = Object.keys(attributes).every(
        (key) => goalCalculation[key] === attributes[key],
      );
      if (unchanged) {
        return;
      }

      return trackMutation(
        updateGoalCalculation({
          variables: {
            input: {
              accountListId,
              attributes: {
                id: goalCalculation.id,
                ...attributes,
              },
            },
          },
          optimisticResponse: {
            updateGoalCalculation: {
              __typename: 'GoalCalculationUpdateMutationPayload',
              goalCalculation: {
                ...goalCalculation,
                ...attributes,
              },
            },
          },
        }),
      );
    },
    [
      accountListId,
      goalCalculation,
      restrictedImpersonation,
      trackMutation,
      updateGoalCalculation,
    ],
  );

  return saveField;
};
