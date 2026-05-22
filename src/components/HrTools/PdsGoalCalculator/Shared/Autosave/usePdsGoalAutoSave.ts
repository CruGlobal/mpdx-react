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
    // Block edits while a save for this same field is in flight. The
    // UpdatePdsGoalCalculation response echoes the full fragment, so a
    // second save landing during the first can overwrite the in-flight
    // value in the Apollo cache with a stale server echo. Also covers the
    // atomic Pay Type write of { salaryOrHourly, payRate: null }, which
    // marks payRate as saving — disabling the blur-driven Pay Rate input
    // while the clear is in flight. We scope to this field only;
    // a *different* field's save in flight can still briefly stamp our
    // optimistic write when its response echoes the full fragment, and
    // that trade-off is accepted to avoid freezing every input on every
    // save. The Pay Type write guards itself separately via isMutating.
    disabled: !calculation || isFieldSaving(fieldName),
  });
};
