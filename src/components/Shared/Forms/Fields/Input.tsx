import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export type InputProps = Pick<
  TextFieldProps,
  | 'children'
  | 'disabled'
  | 'error'
  | 'fullWidth'
  | 'helperText'
  | 'label'
  | 'required'
  | 'select'
  | 'value'
>;

export const Input: React.FC<InputProps> = ({
  children,
  disabled = false,
  error = false,
  fullWidth = true,
  helperText = '',
  label = '',
  required = false,
  select = false,
  value = '',
}) => {
  return (
    <TextField
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      helperText={helperText}
      InputLabelProps={{
        shrink: true,
        sx: {
          position: 'relative',
          transform: 'none',
          color: 'text.primary',
          fontWeight: 700,
          marginBottom: 1,
        },
      }}
      InputProps={{ notched: false }}
      label={label}
      required={required}
      select={select}
      value={value}
      variant="outlined"
    >
      {children}
    </TextField>
  );
};
