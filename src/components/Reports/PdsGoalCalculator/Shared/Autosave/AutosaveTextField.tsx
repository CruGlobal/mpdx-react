import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import * as yup from 'yup';
import { DesignationSupportCalculationUpdateInput } from 'src/graphql/types.generated';
import { usePdsGoalAutoSave } from './usePdsGoalAutoSave';

export interface AutosaveTextFieldProps
  extends Omit<
    TextFieldProps<'outlined'>,
    'value' | 'onChange' | 'onBlur' | 'variant'
  > {
  fieldName: keyof DesignationSupportCalculationUpdateInput;
  schema: yup.Schema;
}

export const AutosaveTextField: React.FC<AutosaveTextFieldProps> = ({
  fieldName,
  schema,
  ...props
}) => {
  const fieldProps = usePdsGoalAutoSave({
    fieldName,
    schema,
    saveOnChange: props.select,
  });

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      {...fieldProps}
      {...props}
      disabled={fieldProps.disabled || props.disabled}
    />
  );
};
