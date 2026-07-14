import { useCallback } from 'react';
import { AdditionalSalaryRequestAttributesInput } from 'src/graphql/types.generated';
import { useRestrictedImpersonation } from 'src/hooks/useRestrictedImpersonation';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useUpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../AdditionalSalaryRequestContext';
import { getTotal } from '../Helper/getTotal';

interface UseSaveFieldOptions {
  formValues: CompleteFormValues;
}

export const useSaveField = ({ formValues }: UseSaveFieldOptions) => {
  const { requestData, trackMutation } = useAdditionalSalaryRequest();
  const restrictedImpersonation = useRestrictedImpersonation();
  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation({
      refetchQueries: ['AdditionalSalaryRequest'],
    });

  const saveField = useCallback(
    async (
      attributes: Partial<AdditionalSalaryRequestAttributesInput>,
    ): Promise<void> => {
      // The tool is read-only during restricted impersonation, so autosave
      // must not fire mutations that the API would reject
      if (restrictedImpersonation) {
        return;
      }

      const request = requestData?.latestAdditionalSalaryRequest;
      const requestId = request?.id;
      if (!requestId) {
        return;
      }

      // Keeps the displayed total in sync with the line items
      const optimisticTotal = getTotal({ ...formValues, ...attributes });

      await trackMutation(
        updateAdditionalSalaryRequest({
          variables: {
            id: requestId,
            attributes,
          },
          optimisticResponse: {
            updateAdditionalSalaryRequest: {
              __typename: 'AdditionalSalaryRequestUpdateMutationPayload',
              additionalSalaryRequest: {
                ...request,
                ...attributes,
                totalAdditionalSalaryRequested: optimisticTotal,
              },
            },
          },
        }),
      );
    },
    [
      formValues,
      restrictedImpersonation,
      updateAdditionalSalaryRequest,
      requestData,
      trackMutation,
    ],
  );

  return saveField;
};
