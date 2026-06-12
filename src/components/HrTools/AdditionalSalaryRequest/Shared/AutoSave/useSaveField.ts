import { useCallback } from 'react';
import { AdditionalSalaryRequestAttributesInput } from 'src/graphql/types.generated';
import { CompleteFormValues } from '../../AdditionalSalaryRequest';
import { useUpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../AdditionalSalaryRequestContext';
import { getTotal } from '../Helper/getTotal';

interface UseSaveFieldOptions {
  formValues: CompleteFormValues;
}

export const useSaveField = ({ formValues }: UseSaveFieldOptions) => {
  const { requestData, trackMutation } = useAdditionalSalaryRequest();
  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation({
      refetchQueries: ['AdditionalSalaryRequest'],
    });

  const saveField = useCallback(
    async (
      attributes: Partial<AdditionalSalaryRequestAttributesInput>,
    ): Promise<void> => {
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
    [formValues, updateAdditionalSalaryRequest, requestData, trackMutation],
  );

  return saveField;
};
