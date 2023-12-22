import React from 'react';
import { MenuItem } from '@mui/material';
import { Input, InputProps } from './Input';

interface SelectProps extends InputProps {
  selectOptions: Array<{ label: string; value: string }>;
}

export const Select: React.FC<SelectProps> = ({
  disabled = false,
  error = false,
  fullWidth = true,
  helperText = '',
  label = '',
  required = false,
  value = '',
  selectOptions = [],
}) => {
  return (
    <Input
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      helperText={helperText}
      label={label}
      required={required}
      value={value}
      select
    >
      {selectOptions.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Input>
  );
};
