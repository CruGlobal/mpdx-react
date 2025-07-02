import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  useUpdateUserOptionMutation,
  useUserOptionQuery,
} from './UserPreference.generated';

interface UseUserPreferenceOptions<T> {
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
export const useUserPreference = <T>({
  key,
  defaultValue,
}: UseUserPreferenceOptions<T>): [
  T,
  Dispatch<SetStateAction<T>>,
  { loading: boolean },
] => {
  const { data, loading, error } = useUserOptionQuery({
    variables: {
      key,
    },
  });
  const [updateUserOption] = useUpdateUserOptionMutation();

  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (!data?.userOption) {
      return;
    }

    if (typeof defaultValue === 'string') {
      setValue((data.userOption.value ?? defaultValue) as T);
    } else {
      try {
        setValue(
          typeof data.userOption.value === 'string'
            ? JSON.parse(data.userOption.value)
            : defaultValue,
        );
      } catch {
        setValue(defaultValue);
      }
    }
  }, [data]);

  const changeValue = useCallback(
    (newValueArg: SetStateAction<T>) => {
      // The new value can be the value or a function that we call with the old value to get the new
      // value. This is the same API as useState().
      const newValue =
        typeof newValueArg === 'function'
          ? (newValueArg as (oldValue: T) => T)(value)
          : newValueArg;

      if (newValue === value) {
        return;
      }

      const serializedValue =
        typeof newValue === 'string' ? newValue : JSON.stringify(newValue);
      updateUserOption({
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

  return [value, changeValue, { loading: loading && !data && !error }];
};
