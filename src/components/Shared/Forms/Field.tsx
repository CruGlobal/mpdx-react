import React, { ReactElement, useState } from 'react';
import {
  CheckBox,
  CheckBoxOutlineBlank,
  RadioButtonChecked,
  RadioButtonUnchecked,
} from '@mui/icons-material';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlLabelProps,
  FormHelperText,
  FormLabel,
  MenuItem,
  OutlinedInput,
  OutlinedInputProps,
  Radio,
  Select,
  Theme,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  '& .MuiFormControlLabel-label': {
    fontWeight: '700',
  },
}));

export const StyledFormHelperText = styled(FormHelperText)(({ theme }) => ({
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

export enum TypeEnum {
  Input = 'input',
  Select = 'select',
  Checkbox = 'checkbox',
  Radio = 'radio',
}

export enum helperPositionEnum {
  Top = 'top',
  Bottom = 'bottom',
}

interface FormProps {
  label?: string;
  helperText?: string;
  helperPosition?: helperPositionEnum;
  type?: TypeEnum;
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

export const Form: React.FC<FormProps> = ({
  label = '',
  helperText = '',
  helperPosition = helperPositionEnum.Top,
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
      {label && <StyledFormLabel required={required}>{label}</StyledFormLabel>}

      {/* Helper text */}
      {helperText && helperPosition === helperPositionEnum.Top && (
        <StyledFormHelperText>{helperText}</StyledFormHelperText>
      )}

      {/* Input field */}
      {type === TypeEnum.Input && (
        <StyledOutlinedInput
          type={inputType}
          placeholder={inputPlaceholder}
          required={required}
          value={inputValue}
          startAdornment={inputStartIcon}
        />
      )}

      {/* Select field */}
      {type === TypeEnum.Select && options.length && (
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
      {(type === TypeEnum.Checkbox || type === TypeEnum.Radio) &&
        options.map(([optionVal, optionLabel], index) => {
          const icon =
            type === TypeEnum.Checkbox ? (
              <Checkbox icon={checkboxIcon} checkedIcon={checkboxCheckedIcon} />
            ) : (
              <Radio
                name={radioName}
                icon={radioIcon}
                checkedIcon={radioCheckedIcon}
              />
            );

          const val = type === TypeEnum.Checkbox ? optionVal : radioValue;

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
      {helperText !== '' && helperPosition === helperPositionEnum.Bottom && (
        <StyledFormHelperText>{helperText}</StyledFormHelperText>
      )}
    </FormControl>
  );
};
