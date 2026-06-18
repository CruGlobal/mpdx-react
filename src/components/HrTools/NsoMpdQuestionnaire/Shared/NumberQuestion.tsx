import React from 'react';
import { TextField } from '@mui/material';
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

  return (
    <TextField
      label={question}
      helperText={error ? errorText : helperText}
      error={error}
      size="small"
      type="number"
      inputProps={{ min: 0, inputMode: 'numeric' }}
      InputProps={{ startAdornment }}
      {...fieldProps}
    />
  );
};
