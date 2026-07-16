import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { useRestrictedImpersonation } from 'src/hooks/useRestrictedImpersonation';
import { useUpdatePdsGoalCalculationMutation } from '../../GoalsList/PdsGoalCalculations.generated';
import { usePdsGoalCalculator } from '../PdsGoalCalculatorContext';

export const useSaveField = () => {
  const { calculation, trackFieldMutation } = usePdsGoalCalculator();
  const [updatePdsGoalCalculation] = useUpdatePdsGoalCalculationMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const restrictedImpersonation = useRestrictedImpersonation();

  const saveField = useCallback(
    async (attributes: Partial<DesignationSupportCalculationUpdateInput>) => {
      // The tool is read-only during restricted impersonation, so autosave
      // must not fire mutations that the API would reject
      if (restrictedImpersonation || !calculation) {
        return;
      }

      const unchanged = Object.keys(attributes).every(
        (key) => calculation[key] === attributes[key],
      );
      if (unchanged) {
        return;
      }

      try {
        return await trackFieldMutation(
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
          Object.keys(attributes) as Array<
            keyof DesignationSupportCalculationUpdateInput
          >,
        );
      } catch {
        enqueueSnackbar(t('Failed to save changes. Please try again.'), {
          variant: 'error',
        });
      }
    },
    [
      calculation,
      restrictedImpersonation,
      trackFieldMutation,
      updatePdsGoalCalculation,
      enqueueSnackbar,
      t,
    ],
  );

  return saveField;
};
