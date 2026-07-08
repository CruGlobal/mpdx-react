import React, { useId } from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import * as yup from 'yup';
import {
  QuestionnaireField,
  useQuestionnaireAutoSave,
} from './useQuestionnaireAutoSave';

export interface RadioOption {
  value: string;
  label: string;
}

interface RadioQuestionProps {
  fieldName: QuestionnaireField;
  schema: yup.Schema;
  label: string;
  options: RadioOption[];
  /** Lay the options out horizontally instead of stacked. */
  row?: boolean;
}

/**
 * A single required radio question wired to {@link useQuestionnaireAutoSave}. Saves on change and
 * surfaces the schema's validation message as helper text while empty.
 */
export const RadioQuestion: React.FC<RadioQuestionProps> = ({
  fieldName,
  schema,
  label,
  options,
  row = false,
}) => {
  const labelId = useId();
  const helperTextId = useId();
  const { error, helperText, ...fieldProps } = useQuestionnaireAutoSave({
    fieldName,
    schema,
    saveOnChange: true,
  });

  return (
    <FormControl error={error} required>
      <FormLabel component="span" id={labelId} sx={{ color: 'text.primary' }}>
        {label}
      </FormLabel>
      <RadioGroup
        row={row}
        sx={{ paddingInline: 2 }}
        aria-labelledby={labelId}
        aria-describedby={helperText ? helperTextId : undefined}
        aria-required
        {...fieldProps}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {helperText && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
