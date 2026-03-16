import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { MinistryHousingAllowanceRequestAttributesInput } from 'pages/api/graphql-rest.page.generated';
import { calculateAnnualTotals } from 'src/hooks/useAnnualTotal';
import { useLocale } from 'src/hooks/useLocale';
import { amountFormat } from 'src/lib/intlFormat';
import { useUpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';

interface UseSaveFieldOptions {
  formValues?: CalculationFormValues;
}

export const useSaveField = ({ formValues }: UseSaveFieldOptions) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();

  const { requestData, trackMutation } = useMinisterHousingAllowance();
  const [updateMinistryHousingAllowanceRequest] =
    useUpdateMinistryHousingAllowanceRequestMutation({});
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
      const roundedOverallAmount = amountFormat(overallAmount, locale);

      return trackMutation(
        updateMinistryHousingAllowanceRequest({
          variables: {
            input: {
              requestId: requestData.id,
              requestAttributes: {
                ...attributes,
                overallAmount: roundedOverallAmount,
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
                  __typename: 'MhaRequestAttributes',
                  ...values,
                  ...attributes,
                  overallAmount,
                },
              },
            },
          },
          onCompleted: () => {
            const hasValue = Object.values(attributes).some(
              (value) => value !== null,
            );
            if (hasValue) {
              enqueueSnackbar(t('Saved successfully'), { variant: 'success' });
            }
          },
        }),
      );
    },
    [
      formValues,
      updateMinistryHousingAllowanceRequest,
      requestData,
      values,
      trackMutation,
      t,
    ],
  );

  return saveField;
};
