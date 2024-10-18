import { useCallback, useEffect, useState } from 'react';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useUserOptionQuery } from './UserPreference.generated';

/**
 * This hook makes saving state as a user preference as easy as using `useState`.
 *
 * @param key The unique name of the user preference key.
 * @param defaultValue The initial value while waiting for the user preferences to load.
 */
export const useSavedPreference = (
  key: string,
  defaultValue: string = '',
): [string, (value: string) => void] => {
  const { data } = useUserOptionQuery({
    variables: {
      key,
    },
  });
  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (data?.userOption) {
      setValue(data?.userOption.value ?? defaultValue);
    }
  }, [data]);

  const changeValue = useCallback(
    (newValue: string) => {
      if (newValue === value) {
        return;
      }

      updateUserOptions({
        variables: {
          key,
          value: newValue,
        },
        optimisticResponse: {
          createOrUpdateUserOption: {
            option: {
              __typename: 'Option' as const,
              key,
              value: newValue,
            },
          },
        },
      });
    },
    [value, key],
  );

  return [value, changeValue];
};
