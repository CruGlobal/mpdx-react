import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { usePdsGoalCalculator } from 'src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorContext';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { useUpdatePdsGoalCalculationMutation } from '../../GoalsList/PdsGoalCalculations.generated';

export const useSaveField = () => {
  const { calculation, trackMutation } = usePdsGoalCalculator();
  const [updatePdsGoalCalculation] = useUpdatePdsGoalCalculationMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

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

      try {
        return await trackMutation(
          updatePdsGoalCalculation({
            variables: {
              attributes: {
                id: calculation.id,
                ...attributes,
              },
            },
            optimisticResponse: {
              updateDesignationSupportCalculation: {
                __typename:
                  'DesignationSupportCalculationUpdateMutationPayload',
                designationSupportCalculation: {
                  __typename: 'DesignationSupportCalculation',
                  ...calculation,
                  ...attributes,
                },
              },
            },
          }),
        );
      } catch {
        enqueueSnackbar(t('Failed to save changes. Please try again.'), {
          variant: 'error',
        });
      }
    },
    [calculation, trackMutation, updatePdsGoalCalculation, enqueueSnackbar, t],
  );

  return saveField;
};
