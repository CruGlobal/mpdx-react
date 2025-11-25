import { useCallback } from 'react';
import { useFormikContext } from 'formik';
import { CalculationFormValues } from '../../Steps/StepThree/Calculation';

// Created temporarily to test autosave without query and mutation logic

export const useSaveField = () => {
  const { values } = useFormikContext<CalculationFormValues>();

  const saveField = useCallback(
    async (attributes: Partial<CalculationFormValues>) => {
      if (!values) {
        return;
      }

      const unchanged = Object.keys(attributes).every((key) => {
        const k = key as keyof CalculationFormValues;
        return values[k] === attributes[k];
      });
      if (unchanged) {
        return;
      }

      const updated: CalculationFormValues = {
        ...values,
        ...attributes,
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          'calculationFormValues',
          JSON.stringify(updated),
        );
      }
    },
    [values],
  );

  return saveField;
};
