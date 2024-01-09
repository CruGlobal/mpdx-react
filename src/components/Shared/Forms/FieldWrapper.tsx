import React from 'react';
import { FormControl, FormControlProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  HelperPositionEnum,
  StyledFormHelperText,
  StyledFormLabel,
} from './FieldHelper';

interface FieldWrapperProps {
  labelText?: string;
  helperText?: string;
  helperPosition?: HelperPositionEnum;
  formControlDisabled?: FormControlProps['disabled'];
  formControlError?: FormControlProps['error'];
  formControlFullWidth?: FormControlProps['fullWidth'];
  formControlRequired?: FormControlProps['required'];
  formControlVariant?: FormControlProps['variant'];
  formHelperTextProps?: object;
  children?: React.ReactNode;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  labelText = '',
  helperText = '',
  helperPosition = HelperPositionEnum.Top,
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
      {helperPosition === HelperPositionEnum.Top && helperTextOutput}
      {children}
      {helperPosition === HelperPositionEnum.Bottom && helperTextOutput}
    </FormControl>
  );
};
