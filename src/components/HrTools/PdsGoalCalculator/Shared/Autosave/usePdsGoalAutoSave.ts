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
  const { calculation } = usePdsGoalCalculator();

  return useAutoSave({
    value: calculation?.[fieldName] as string | number | null | undefined,
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    disabled: !calculation,
    ...options,
  });
};
