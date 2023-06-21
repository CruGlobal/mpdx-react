import React, { ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormControlProps,
  FormHelperText,
  FormHelperTextProps,
  FormLabel,
  MenuItem,
  OutlinedInput,
  OutlinedInputProps,
  Radio,
  Select,
  Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckBox,
  CheckBoxOutlineBlank,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material';

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  '& .MuiFormControlLabel-label': {
    fontWeight: '700',
  },
}));

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
  margin: 0,
  fontSize: 16,
  color: theme.palette.text.primary,
  '&:not(:first-child)': {
    marginTop: theme.spacing(1),
  },
}));

const SharedFieldStyles = ({ theme }: { theme: Theme }) => ({
  '&:not(:first-child)': {
    marginTop: theme.spacing(1),
  },
});

export const StyledOutlinedInput = styled(OutlinedInput)(SharedFieldStyles);
export const StyledSelect = styled(Select)(SharedFieldStyles);

interface PersPrefFieldProps {
  label?: string;
  helperText?: string;
  helperPosition?: string;
  type?: string;
  inputType?: string;
  inputValue?: string;
  inputPlaceholder?: string;
  inputStartIcon?: OutlinedInputProps['startAdornment'] | boolean;
  options?: string[][];
  selectValue?: string;
  labelPlacement?: FormControlLabelProps['labelPlacement'];
  checkboxIcon?: ReactElement;
  checkboxCheckedIcon?: ReactElement;
  radioName?: string;
  radioValue?: string;
  radioIcon?: ReactElement;
  radioCheckedIcon?: ReactElement;
  checked?: boolean;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const PersPrefField: React.FC<PersPrefFieldProps> = ({
  label = '',
  helperText = '',
  helperPosition = 'top',
  type = 'input',
  inputType = 'text',
  inputValue = '',
  inputPlaceholder = '',
  inputStartIcon = false,
  options = [],
  selectValue = '',
  labelPlacement = 'end',
  checkboxIcon = <CheckBoxOutlineBlank />,
  checkboxCheckedIcon = <CheckBox />,
  radioName = '',
  radioValue = '',
  radioIcon = <RadioButtonUnchecked />,
  radioCheckedIcon = <RadioButtonChecked />,
  checked = false,
  required = false,
  className = '',
  disabled = false,
}) => {
  const [selectValueState, setSelectValueState] = useState(selectValue);

  return (
    <FormControl
      variant="outlined"
      className={className}
      disabled={disabled}
      fullWidth
    >
      {/* Label */}
      {label !== '' && (
        <StyledFormLabel required={required}>{label}</StyledFormLabel>
      )}

      {/* Helper text */}
      {helperText !== '' && helperPosition === 'top' && (
        <StyledFormHelperText>{helperText}</StyledFormHelperText>
      )}

      {/* Input field */}
      {type === 'input' && (
        <StyledOutlinedInput
          type={inputType}
          placeholder={inputPlaceholder}
          required={required}
          value={inputValue}
          startAdornment={inputStartIcon}
        />
      )}

      {/* Select field */}
      {type === 'select' && options.length > 0 && (
        <StyledSelect
          value={selectValueState}
          onChange={(e) => setSelectValueState(e.target.value as string)}
        >
          {options.map(([optionVal, optionLabel], index) => {
            return (
              <MenuItem value={optionVal} key={index}>
                {optionLabel}
              </MenuItem>
            );
          })}
        </StyledSelect>
      )}

      {/* Checkboxes or Radios */}
      {(type === 'checkbox' || type === 'radio') &&
        options.map(([optionVal, optionLabel], index) => {
          const icon =
            type === 'checkbox' ? (
              <Checkbox icon={checkboxIcon} checkedIcon={checkboxCheckedIcon} />
            ) : (
              <Radio
                name={radioName}
                icon={radioIcon}
                checkedIcon={radioCheckedIcon}
              />
            );

          const val = type === 'checkbox' ? optionVal : radioValue;

          return (
            <FormControlLabel
              control={icon}
              value={val}
              label={optionLabel}
              labelPlacement={labelPlacement}
              checked={checked}
              key={index}
            />
          );
        })}

      {/* Helper text */}
      {helperText !== '' && helperPosition === 'bottom' && (
        <StyledFormHelperText>{helperText}</StyledFormHelperText>
      )}
    </FormControl>
  );
};

interface PersPrefFieldWrapperProps {
  labelText?: string;
  helperText?: string;
  helperPosition?: string;
  formControlDisabled?: FormControlProps['disabled'];
  formControlError?: FormControlProps['error'];
  formControlFullWidth?: FormControlProps['fullWidth'];
  formControlRequired?: FormControlProps['required'];
  formControlVariant?: FormControlProps['variant'];
  formHelperTextProps?: { variant?: FormHelperTextProps['variant'] };
  children?: React.ReactNode;
}

export const PersPrefFieldWrapper: React.FC<PersPrefFieldWrapperProps> = ({
  labelText = '',
  helperText = '',
  helperPosition = 'top',
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
    <StyledFormLabel>{t(labelText)}</StyledFormLabel>
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
      {helperPosition === 'top' && helperTextOutput}
      {children}
      {helperPosition === 'bottom' && helperTextOutput}
    </FormControl>
  );
};
