import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { GoalCalculationUpdateInput } from 'src/graphql/types.generated';
import { useAutoSave } from './useAutosave';

export interface AutosaveTextFieldProps
  extends Omit<TextFieldProps<'outlined'>, 'value' | 'onChange' | 'onBlur'> {
  fieldName: keyof GoalCalculationUpdateInput;
  schema: yup.Schema;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  ...props
}) => {
  const fieldProps = useAutoSave({
    fieldName,
    schema,
    // Select boxes should save on change instead of on blur
    saveOnChange: props.select,
  });

  return <TextField {...fieldProps} {...props} />;
};
