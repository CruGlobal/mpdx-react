import React from 'react';
import { InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { LabeledField } from './LabeledField';
import {
  QuestionnaireField,
  useQuestionnaireAutoSave,
} from './useQuestionnaireAutoSave';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectQuestionProps {
  fieldName: QuestionnaireField;
  schema: yup.Schema;
  label: string;
  options: SelectOption[];
  /** Text for the disabled, empty placeholder option. */
  placeholder: string;
  /** Optional leading adornment rendered inside the field. */
  startAdornment?: React.ReactNode;
  /** Disable the select, e.g. while its options load or are unavailable. */
  disabled?: boolean;
  /** Guidance shown below the field when there is no error. */
  helperText?: React.ReactNode;
  /**
   * An external error message (e.g. a load failure) that supersedes field validation. When set,
   * the field renders in its error state with this message.
   */
  errorText?: string;
}

/**
 * A single required dropdown question wired to {@link useQuestionnaireAutoSave}. Saves on change and
 * surfaces the schema's validation message while invalid, unless an external {@link errorText}
 * (such as a load failure) takes precedence.
 */
export const SelectQuestion: React.FC<SelectQuestionProps> = ({
  fieldName,
  schema,
  label,
  options,
  placeholder,
  startAdornment,
  disabled = false,
  helperText,
  errorText,
}) => {
  const {
    error: fieldError,
    helperText: fieldErrorText,
    ...fieldProps
  } = useQuestionnaireAutoSave({ fieldName, schema, saveOnChange: true });

  const error = Boolean(errorText) || Boolean(fieldError);
  const shownHelperText =
    errorText ?? (fieldError ? fieldErrorText : helperText);

  return (
    <LabeledField
      label={label}
      required
      error={error}
      helperText={shownHelperText}
    >
      {(aria) => (
        <TextField
          select
          required
          error={error}
          size="small"
          slotProps={{
            select: {
              displayEmpty: true,
              labelId: aria['aria-labelledby'],
            },
            htmlInput: { 'aria-describedby': aria['aria-describedby'] },
            input: startAdornment
              ? {
                  startAdornment: (
                    <InputAdornment position="start">
                      {startAdornment}
                    </InputAdornment>
                  ),
                }
              : undefined,
          }}
          {...fieldProps}
          disabled={disabled}
        >
          <MenuItem value="" disabled>
            <Typography component="span" color="text.secondary">
              {placeholder}
            </Typography>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </LabeledField>
  );
};
