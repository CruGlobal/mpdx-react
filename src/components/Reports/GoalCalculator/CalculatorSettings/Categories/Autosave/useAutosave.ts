import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { prepareDataForValidation } from 'formik';
import * as yup from 'yup';
import { useGoalCalculator } from 'src/components/Reports/GoalCalculator/Shared/GoalCalculatorContext';
import { GoalCalculationUpdateInput } from 'src/graphql/types.generated';
import { useSaveField } from './useSaveField';

interface UseAutoSaveOptions {
  fieldName: keyof GoalCalculationUpdateInput;
  schema: yup.Schema;
  saveOnChange?: boolean;
}

export const useAutoSave = ({
  fieldName,
  schema,
  saveOnChange = false,
}: UseAutoSaveOptions) => {
  const saveField = useSaveField();
  const {
    goalCalculationResult: { data },
  } = useGoalCalculator();

  const value: string = data?.goalCalculation[fieldName]?.toString() ?? '';
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const parseValue = useCallback(
    (valueToValidate: string) => {
      try {
        // Use the same logic that Formik does to massage data before schema validation: primarily
        // converting empty strings to undefined
        const values = prepareDataForValidation({
          [fieldName]: valueToValidate,
        });
        const parsedValue = schema.validateSyncAt(fieldName, values) ?? null;
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
        if (!errorMessage) {
          saveField({ [fieldName]: parsedValue });
        }
      }
    },
    onBlur: () => {
      if (!saveOnChange && !errorMessage) {
        saveField({ [fieldName]: parsedValue });
      }
    },
    ...(errorMessage ? { error: true, helperText: errorMessage } : {}),
  };
};
