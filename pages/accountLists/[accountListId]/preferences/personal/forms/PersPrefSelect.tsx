import React from 'react';
import { MenuItem } from '@mui/material';
import { PersPrefInput, PersPrefInputProps } from './PersPrefInput';

interface PersPrefSelectProps extends PersPrefInputProps {
  selectOptions: Array<{ label: string; value: string }>;
}

export const PersPrefSelect: React.FC<PersPrefSelectProps> = ({
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
    <PersPrefInput
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
    </PersPrefInput>
  );
};
