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
      const requestId = requestData?.latestAdditionalSalaryRequest?.id;
      if (!requestId) {
        return;
      }

      // Merge the new attributes with current form values to calculate total
      const updatedValues = {
        ...formValues,
        ...attributes,
      } as CompleteFormValues;
      const totalAdditionalSalaryRequested = getTotal(updatedValues);

      await trackMutation(
        updateAdditionalSalaryRequest({
          variables: {
            id: requestId,
            attributes: {
              ...attributes,
              totalAdditionalSalaryRequested,
            },
          },
        }),
      );
    },
    [formValues, updateAdditionalSalaryRequest, requestData, trackMutation],
  );

  return saveField;
};
