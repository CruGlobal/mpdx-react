import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface TextInputProps {
  children?: TextFieldProps['children'];
  disabled?: TextFieldProps['disabled'];
  error?: TextFieldProps['error'];
  fullWidth?: TextFieldProps['fullWidth'];
  helperText?: TextFieldProps['helperText'];
  label?: TextFieldProps['label'];
  required?: TextFieldProps['required'];
  select?: TextFieldProps['select'];
  value?: TextFieldProps['value'];
}

export const TextInput: React.FC<TextInputProps> = ({
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
