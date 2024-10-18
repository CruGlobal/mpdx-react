import { useCallback, useEffect, useState } from 'react';
import { useUpdateUserOptionsMutation } from 'src/components/Contacts/ContactFlow/ContactFlowSetup/UpdateUserOptions.generated';
import { useUserOptionQuery } from './UserPreference.generated';

interface UseSavedPreferenceOptions<T> {
  /** The unique name of the user preference key. */
  key: string;

  /** The default value when the preference is missing or hasn't loaded yet. */
  defaultValue: T;
}

/**
 * This hook makes saving state as a user preference as easy as using `useState`. If `defaultValue`
 * is not a string, the value will be transparently serialized and deserialized as JSON because the
 * server only supports string option values.
 */
export const useSavedPreference = <T>({
  key,
  defaultValue,
}: UseSavedPreferenceOptions<T>): [T, (value: T) => void] => {
  const { data } = useUserOptionQuery({
    variables: {
      key,
    },
  });
  const [updateUserOptions] = useUpdateUserOptionsMutation();

  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!data?.userOption) {
      return;
    }

    if (typeof defaultValue === 'string') {
      setValue((data.userOption.value ?? defaultValue) as T);
    } else {
      setValue(
        typeof data.userOption.value === 'string'
          ? JSON.parse(data.userOption.value)
          : defaultValue,
      );
    }
  }, [data]);

  const changeValue = useCallback(
    (newValue: T) => {
      if (newValue === value) {
        return;
      }

      const serializedValue =
        typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
      updateUserOptions({
        variables: {
          key,
          value: serializedValue,
        },
        optimisticResponse: {
          createOrUpdateUserOption: {
            option: {
              __typename: 'Option' as const,
              key,
              value: serializedValue,
            },
          },
        },
      });
    },
    [value, key],
  );

  return [value, changeValue];
};
