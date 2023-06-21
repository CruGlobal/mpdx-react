import React from 'react';
import {
  FormControl,
  FormControlProps,
  FormHelperText,
  FormHelperTextProps,
  FormLabel,
  FormLabelProps,
} from '@mui/material';

interface PersPrefFieldWrapperProps {
  children?: FormControlProps['children'];
  disabled?: FormControlProps['disabled'];
  error?: FormControlProps['error'];
  fullWidth?: FormControlProps['fullWidth'];
  helperPosition?: 'top' | 'bottom';
  helperText?: FormHelperTextProps['children'];
  label?: FormLabelProps['children'];
  required?: FormControlProps['required'];
}

export const PersPrefFieldWrapper: React.FC<PersPrefFieldWrapperProps> = ({
  children,
  disabled = false,
  error = false,
  fullWidth = true,
  helperPosition = 'top',
  helperText = '',
  label = '',
  required = false,
}) => {
  const HelperText = () => <FormHelperText>{helperText}</FormHelperText>;

  return (
    <FormControl
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      required={required}
    >
      {/* Label */}
      {label && (
        <FormLabel
          sx={{
            color: 'text.primary',
            fontWeight: 700,
            marginBottom: 1,
          }}
        >
          {label}
        </FormLabel>
      )}

      {/* Helper text - top */}
      {helperText && helperPosition === 'top' && <HelperText />}

      {children}

      {/* Helper text - bottom */}
      {helperText && helperPosition === 'bottom' && <HelperText />}
    </FormControl>
  );
};
