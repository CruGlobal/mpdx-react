import { useCallback } from 'react';
import { AdditionalSalaryRequestAttributesInput } from 'src/graphql/types.generated';
import { useUpdateAdditionalSalaryRequestMutation } from '../../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from '../AdditionalSalaryRequestContext';

export const useSaveField = () => {
  const { requestData, trackMutation } = useAdditionalSalaryRequest();
  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation({
      refetchQueries: ['AdditionalSalaryRequest'],
    });

  const saveField = useCallback(
    async (
      attributes: Partial<AdditionalSalaryRequestAttributesInput>,
    ): Promise<void> => {
      const requestId = requestData?.latestAdditionalSalaryRequest?.id;
      if (!requestId) {
        return;
      }

      await trackMutation(
        updateAdditionalSalaryRequest({
          variables: {
            id: requestId,
            attributes,
          },
        }),
      );
    },
    [updateAdditionalSalaryRequest, requestData, trackMutation],
  );

  return saveField;
};
