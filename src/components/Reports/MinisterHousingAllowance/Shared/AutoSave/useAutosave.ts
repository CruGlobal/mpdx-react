import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TextFieldProps } from '@mui/material';
import { prepareDataForValidation } from 'formik';
import * as yup from 'yup';
import { useLocale } from 'src/hooks/useLocale';
import { useSyncedState } from 'src/hooks/useSyncedState';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';
import { display, parseInput } from './Helper/formatHelper';

interface UseAutoSaveOptions<Value extends string | number | boolean> {
  value: Value | null | undefined;
  saveValue: (value: Value | null) => Promise<unknown>;
  fieldName: keyof CalculationFormValues & string;
  schema: yup.Schema;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean,
  ) => void;
  submitCount?: number;
  disabled?: boolean;
}

export const useAutoSave = <Value extends string | number | boolean>({
  value,
  saveValue,
  fieldName,
  schema,
  setFieldValue,
  setFieldTouched,
  submitCount,
  disabled = false,
}: UseAutoSaveOptions<Value>) => {
  const locale = useLocale();
  const currency = 'USD';
  const isString = fieldName === 'phoneNumber' || fieldName === 'emailAddress';

  const [focused, setFocused] = useState<string | null>(null);
  const isEditing = (name: string) => {
    return focused === name;
  };
  const [hasInteracted, setHasInteracted] = useState(false);

  const [internalValue, setInternalValue] = useSyncedState(
    value?.toString() ?? '',
  );

  // Keep track of last saved value
  const [lastSaved, setLastSaved] = useState<Value | null>(value ?? null);

  useEffect(() => {
    setLastSaved(value ?? null);
  }, [value]);

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
    value: isString
      ? internalValue
      : display(isEditing, fieldName, internalValue, currency, locale),
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setHasInteracted(true);
      const newValue = event.target.value;

      if (newValue === '') {
        setInternalValue('');
        setFieldValue(fieldName, null);
        return;
      }

      if (isString) {
        setInternalValue(newValue);
        setFieldValue(fieldName, newValue);
      } else {
        const parsed = parseInput(newValue);
        const displayValue = String(parsed ?? '');
        setInternalValue(displayValue);
        setFieldValue(fieldName, parsed);
      }
    },
    onBlur: () => {
      setHasInteracted(true);
      setFieldTouched(fieldName, true, true);

      if (focused === fieldName) {
        setFocused(null);
      }

      if (internalValue === '') {
        if (lastSaved !== null) {
          saveValue(null);
          setLastSaved(null);
        }
        return;
      }

      if (!errorMessage && parsedValue !== lastSaved) {
        saveValue(parsedValue);
        setLastSaved(parsedValue);
      }
    },
    onFocus: () => setFocused(fieldName),
    disabled,
    ...(!disabled && errorMessage && (hasInteracted || submitCount)
      ? { error: true, helperText: errorMessage }
      : {}),
  } satisfies Partial<TextFieldProps>;
};
