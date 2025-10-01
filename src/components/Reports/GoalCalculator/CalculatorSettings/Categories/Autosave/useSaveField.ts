import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { GoalCalculationUpdateInput } from 'src/graphql/types.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useUpdateGoalCalculationMutation } from '../SettingsCategory/GoalCalculation.generated';

export const useSaveField = () => {
  const accountListId = useAccountListId() ?? '';
  const {
    goalCalculationResult: { data },
    trackMutation,
  } = useGoalCalculator();
  const goalCalculation = data?.goalCalculation;
  const [updateGoalCalculation] = useUpdateGoalCalculationMutation();

  const saveField = (attributes: Partial<GoalCalculationUpdateInput>) => {
    if (!goalCalculation) {
      return;
    }

    const unchanged = Object.entries(attributes).every(
      ([key, value]) => goalCalculation[key] === value,
    );
    if (unchanged) {
      return;
    }

    trackMutation(
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
  };

  return saveField;
};
