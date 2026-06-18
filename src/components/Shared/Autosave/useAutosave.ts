import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [touched, setTouched] = useState(false);
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

  const transformValue = useCallback(
    (rawValue: string): string => {
      // Apply any schema transforms defined on the field as the user types (e.g. stripping
      // disallowed characters). Transforms must be idempotent.
      const transformed = yup
        .reach(schema, fieldName)
        .cast(rawValue, { assert: false });
      // Only apply string transforms. Number/select schemas cast to non-strings, so keep the raw
      // keystrokes and let parseValue coerce them on save.
      return typeof transformed === 'string' ? transformed : rawValue;
    },
    [schema, fieldName],
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

  const showError = !disabled && errorMessage !== null && touched;

  return {
    value: internalValue,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = transformValue(event.target.value);
      setInternalValue(newValue);

      if (saveOnChange) {
        setTouched(true);
        const { parsedValue, errorMessage } = parseValue(newValue);
        if (errorMessage === null && parsedValue !== value) {
          saveValue(parsedValue);
        }
      }
    },
    onBlur: () => {
      setTouched(true);
      if (!saveOnChange && errorMessage === null && parsedValue !== value) {
        saveValue(parsedValue);
      }
    },
    disabled,
    ...(showError ? { error: true, helperText: errorMessage } : {}),
  } satisfies Partial<TextFieldProps>;
};
