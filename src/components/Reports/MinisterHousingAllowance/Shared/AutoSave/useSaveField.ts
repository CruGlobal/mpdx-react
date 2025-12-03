import { useCallback } from 'react';
import { MinistryHousingAllowanceRequestAttributesInput } from 'pages/api/graphql-rest.page.generated';
import { useUpdateMinistryHousingAllowanceRequestMutation } from '../../MinisterHousingAllowance.generated';
import { useMinisterHousingAllowance } from '../Context/MinisterHousingAllowanceContext';

export const useSaveField = () => {
  const { requestData } = useMinisterHousingAllowance();
  const [updateMinistryHousingAllowanceRequest] =
    useUpdateMinistryHousingAllowanceRequestMutation();
  const values = requestData?.requestAttributes;

  const saveField = useCallback(
    async (
      attributes: Partial<MinistryHousingAllowanceRequestAttributesInput>,
    ) => {
      if (!values || !requestData?.id) {
        return;
      }

      return updateMinistryHousingAllowanceRequest({
        variables: {
          input: {
            requestId: requestData.id,
            requestAttributes: attributes,
          },
        },
        optimisticResponse: {
          updateMinistryHousingAllowanceRequest: {
            __typename: 'MinistryHousingAllowanceRequestUpdateMutationPayload',
            ministryHousingAllowanceRequest: {
              ...requestData,
              requestAttributes: {
                ...values,
                ...attributes,
              },
            },
          },
        },
      });
    },
    [values, updateMinistryHousingAllowanceRequest, requestData],
  );

  return saveField;
};
