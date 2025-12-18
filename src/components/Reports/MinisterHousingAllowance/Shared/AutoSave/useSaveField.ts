import { useCallback } from 'react';
import { MinistryHousingAllowanceRequestAttributesInput } from 'pages/api/graphql-rest.page.generated';
import { calculateAnnualTotals } from 'src/hooks/useAnnualTotal';
import { useUpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';

interface UseSaveFieldOptions {
  formValues?: CalculationFormValues;
}

export const useSaveField = ({ formValues }: UseSaveFieldOptions) => {
  const { requestData } = useMinisterHousingAllowance();
  const [updateMinistryHousingAllowanceRequest] =
    useUpdateMinistryHousingAllowanceRequestMutation({
      refetchQueries: ['MinistryHousingAllowanceRequest'],
    });
  const values = requestData?.requestAttributes;

  const saveField = useCallback(
    async (
      attributes: Partial<MinistryHousingAllowanceRequestAttributesInput>,
    ) => {
      if (!requestData?.id) {
        return;
      }

      const updatedValues = {
        ...formValues,
        ...attributes,
      } as CalculationFormValues;
      const { annualTotal: overallAmount } =
        calculateAnnualTotals(updatedValues);

      try {
        await updateMinistryHousingAllowanceRequest({
          variables: {
            input: {
              requestId: requestData.id,
              requestAttributes: {
                ...attributes,
                overallAmount,
              },
            },
          },
          optimisticResponse: {
            updateMinistryHousingAllowanceRequest: {
              __typename:
                'MinistryHousingAllowanceRequestUpdateMutationPayload',
              ministryHousingAllowanceRequest: {
                ...requestData,
                requestAttributes: {
                  ...values,
                  ...attributes,
                  overallAmount,
                },
              },
            },
          },
        });
      } catch (error) {}
    },
    [formValues, updateMinistryHousingAllowanceRequest, requestData],
  );

  return saveField;
};
