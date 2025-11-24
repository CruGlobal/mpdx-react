import React, { useCallback, useMemo } from 'react';
import { TextFieldProps } from '@mui/material';
import { prepareDataForValidation } from 'formik';
import * as yup from 'yup';
import { useSyncedState } from 'src/hooks/useSyncedState';

interface UseAutoSaveOptions<Value extends string | number> {
  value: Value | null | undefined;
  saveValue: (value: Value | null) => Promise<unknown>;
  fieldName: string;
  schema: yup.Schema;
  disabled?: boolean;
  saveOnChange?: boolean;
}

export const useAutoSave = <Value extends string | number>({
  value,
  saveValue,
  fieldName,
  schema,
  disabled = false,
  saveOnChange = false,
}: UseAutoSaveOptions<Value>) => {
  const [internalValue, setInternalValue] = useSyncedState(
    value?.toString() ?? '',
  );

  const parseValue = useCallback(
    (valueToValidate: string) => {
      try {
        // Use the same logic that Formik does to massage data before schema validation: primarily
        // converting empty strings to undefined
        const values = prepareDataForValidation({
          [fieldName]: valueToValidate,
        });
        const parsedValue: Value | null =
          schema.validateSyncAt(fieldName, values) ?? null;
        return { parsedValue, errorMessage: null };
      } catch (error) {
        if (error instanceof yup.ValidationError) {
          return { parsedValue: null, errorMessage: error.message };
        }
        throw error;
      }
    },
    [fieldName, schema],
  );

  const { parsedValue, errorMessage } = useMemo(
    () => parseValue(internalValue),
    [parseValue, internalValue],
  );

  return {
    value: internalValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);

      if (saveOnChange) {
        const { parsedValue, errorMessage } = parseValue(newValue);
        if (!errorMessage && parsedValue !== value) {
          saveValue(parsedValue);
        }
      }
    },
    onBlur: () => {
      if (!saveOnChange && !errorMessage && parsedValue !== value) {
        saveValue(parsedValue);
      }
    },
    disabled,
    ...(!disabled && errorMessage
      ? { error: true, helperText: errorMessage }
      : {}),
  } satisfies Partial<TextFieldProps>;
};
