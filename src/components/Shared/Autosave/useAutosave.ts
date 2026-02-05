import React, { useCallback, useEffect, useMemo } from 'react';
import { TextFieldProps } from '@mui/material';
import { prepareDataForValidation } from 'formik';
import * as yup from 'yup';
import { useSyncedState } from 'src/hooks/useSyncedState';
import { useOptionalAutosaveForm } from './AutosaveForm';

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
  const { markValid, markInvalid } = useOptionalAutosaveForm() ?? {};

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

  useEffect(() => {
    if (errorMessage === null) {
      markValid?.(fieldName);
    } else {
      markInvalid?.(fieldName);
    }

    // Remove fields previously marked as invalid when the field is removed
    return () => {
      markValid?.(fieldName);
    };
  }, [fieldName, errorMessage, markValid, markInvalid]);

  return {
    value: internalValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);

      if (saveOnChange) {
        const { parsedValue, errorMessage } = parseValue(newValue);
        if (errorMessage === null && parsedValue !== value) {
          saveValue(parsedValue);
        }
      }
    },
    onBlur: () => {
      if (!saveOnChange && errorMessage === null && parsedValue !== value) {
        saveValue(parsedValue);
      }
    },
    disabled,
    ...(!disabled && errorMessage !== null
      ? { error: true, helperText: errorMessage }
      : {}),
  } satisfies Partial<TextFieldProps>;
};
