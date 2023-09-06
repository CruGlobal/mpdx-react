import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormControlProps,
  FormHelperTextProps,
} from '@mui/material';
import {
  helperPositionEnum,
  StyledFormHelperText,
  StyledFormLabel,
} from './Field';

interface FieldWrapperProps {
  labelText?: string;
  helperText?: string;
  helperPosition?: helperPositionEnum;
  formControlDisabled?: FormControlProps['disabled'];
  formControlError?: FormControlProps['error'];
  formControlFullWidth?: FormControlProps['fullWidth'];
  formControlRequired?: FormControlProps['required'];
  formControlVariant?: FormControlProps['variant'];
  formHelperTextProps?: { variant?: FormHelperTextProps['variant'] };
  children?: React.ReactNode;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  labelText = '',
  helperText = '',
  helperPosition = helperPositionEnum.Top,
  formControlDisabled = false,
  formControlError = false,
  formControlFullWidth = true,
  formControlRequired = false,
  formControlVariant = 'outlined',
  formHelperTextProps = { variant: 'standard' },
  children,
}) => {
  const { t } = useTranslation();
  const labelOutput = labelText ? (
    <StyledFormLabel
      sx={{
        color: 'text.primary',
        fontWeight: 700,
        marginBottom: 1,
      }}
    >
      {t(labelText)}
    </StyledFormLabel>
  ) : (
    ''
  );

  const helperTextOutput = helperText ? (
    <StyledFormHelperText {...formHelperTextProps}>
      {t(helperText)}
    </StyledFormHelperText>
  ) : (
    ''
  );

  return (
    <FormControl
      disabled={formControlDisabled}
      error={formControlError}
      fullWidth={formControlFullWidth}
      required={formControlRequired}
      variant={formControlVariant}
    >
      {labelOutput}
      {helperPosition === helperPositionEnum.Top && helperTextOutput}
      {children}
      {helperPosition === helperPositionEnum.Bottom && helperTextOutput}
    </FormControl>
  );
};
