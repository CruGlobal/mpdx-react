import * as yup from 'yup';
import { usePdsGoalCalculator } from 'src/components/Reports/PdsGoalCalculator/Shared/PdsGoalCalculatorContext';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
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
  const { calculation } = usePdsGoalCalculator();

  return useAutoSave({
    value: calculation?.[fieldName] as string | number | null | undefined,
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    disabled: !calculation,
    ...options,
  });
};
