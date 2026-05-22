import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { usePdsGoalCalculator } from '../PdsGoalCalculatorContext';
import { useSaveField } from './useSaveField';

interface UsePdsAutoSaveOptions {
  fieldName: keyof DesignationSupportCalculationUpdateInput;
  schema: yup.Schema;
  saveOnChange?: boolean;
}

export const usePdsGoalAutoSave = ({
  fieldName,
  ...options
}: UsePdsAutoSaveOptions) => {
  const saveField = useSaveField();
  const { calculation, isFieldSaving } = usePdsGoalCalculator();

  return useAutoSave({
    value: calculation?.[fieldName] as string | number | null | undefined,
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    ...options,
    // Block change-driven (select) autosaves while a save is in flight: rapid
    // back-and-forth toggles can otherwise land out of order in the Apollo
    // cache. formType is the load-bearing case — its value reshapes the goal
    // calculation, so a stale final value silently understates the total.
    disabled: !calculation || isFieldSaving(fieldName),
  });
};
