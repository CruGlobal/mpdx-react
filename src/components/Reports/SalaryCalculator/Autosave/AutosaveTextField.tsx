import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { useAutoSave } from 'src/components/Shared/Autosave/useAutosave';
import { SalaryRequestUpdateInput } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useSaveField } from './useSaveField';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    // Don't allow overriding any props managed by useAutoSave
    keyof ReturnType<typeof useAutoSave> | 'variant'
  > {
  fieldName: Exclude<keyof SalaryRequestUpdateInput, 'manuallySplitCap'>;
  schema: yup.Schema;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  ...props
}) => {
  const saveField = useSaveField();
  const { calculation } = useSalaryCalculator();

  const fieldProps = useAutoSave({
    value: calculation?.[fieldName],
    saveValue: (value) => saveField({ [fieldName]: value }),
    fieldName,
    schema,
    disabled: !calculation,
  });

  return <TextField size="small" fullWidth {...fieldProps} {...props} />;
};
