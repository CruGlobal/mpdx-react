import { useCallback } from 'react';
import { SalaryRequestUpdateInput } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useUpdateSalaryCalculationMutation } from './SalaryCalculation.generated';

export const useSaveField = () => {
  const { calculation } = useSalaryCalculator();
  const [updateCalculation] = useUpdateSalaryCalculationMutation();

  const saveField = useCallback(
    async (attributes: Partial<SalaryRequestUpdateInput>) => {
      if (!calculation) {
        return;
      }

      const unchanged = Object.keys(attributes).every(
        (key) => calculation[key] === attributes[key],
      );
      if (unchanged) {
        return;
      }

      return updateCalculation({
        variables: {
          input: {
            attributes: {
              id: calculation.id,
              ...attributes,
            },
          },
        },
        optimisticResponse: {
          updateSalaryRequest: {
            __typename: 'SalaryRequestUpdateMutationPayload',
            salaryRequest: {
              ...calculation,
              ...attributes,
            },
          },
        },
      });
    },
    [calculation, updateCalculation],
  );

  return saveField;
};
