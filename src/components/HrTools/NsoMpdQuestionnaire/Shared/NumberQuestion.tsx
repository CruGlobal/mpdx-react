import React, { useId } from 'react';
import { FormControl, FormHelperText, OutlinedInput } from '@mui/material';
import * as yup from 'yup';
import { useQuestionnaireAutoSave } from './useQuestionnaireAutoSave';

interface NumberQuestionProps {
  fieldName: string;
  schema: yup.Schema;
  question: string;
  helperText: string;
  /** Optional leading adornment rendered inside the input. */
  startAdornment?: React.ReactNode;
}

/**
 * A single whole-number input wired to {@link useQuestionnaireAutoSave}. Saves on blur and replaces
 * the helper text with the schema's validation message while the value is invalid.
 */
export const NumberQuestion: React.FC<NumberQuestionProps> = ({
  fieldName,
  schema,
  question,
  helperText,
  startAdornment,
}) => {
  const {
    error,
    helperText: errorText,
    ...fieldProps
  } = useQuestionnaireAutoSave({ fieldName, schema });
  const helperTextId = useId();

  return (
    <FormControl error={error}>
      <OutlinedInput
        size="small"
        type="number"
        inputProps={{
          min: 0,
          inputMode: 'numeric',
          'aria-label': question,
          'aria-describedby': helperTextId,
        }}
        startAdornment={startAdornment}
        placeholder={question}
        sx={{ 'input::placeholder': { opacity: 0.8 } }}
        {...fieldProps}
      />
      <FormHelperText id={helperTextId}>
        {error ? errorText : helperText}
      </FormHelperText>
    </FormControl>
  );
};
