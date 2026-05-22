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
  const busy = isFieldSaving(fieldName);

  const autoSaveProps = useAutoSave({
    value: calculation?.[fieldName] as string | number | null | undefined,
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    ...options,
    // Disable a field while its own save is in flight (including multi-field
    // atomic saves like salaryOrHourly + payRate). Prevents rapid back-and-forth
    // writes from landing out of order in the Apollo cache while leaving
    // unrelated fields interactive. formType is the load-bearing case — its
    // value reshapes the goal calculation, so a stale final value silently
    // understates the total.
    disabled: !calculation || busy,
  });

  // Distinguish the "saving in flight" disable from the "calculation not
  // loaded" / externally-disabled cases. Callers signal the former with
  // aria-busy so the field reads as "busy" rather than "unavailable."
  return { ...autoSaveProps, busy };
};
