import React from 'react';
import { TextField } from '@mui/material';
import * as yup from 'yup';
import { LabeledField } from './LabeledField';
import {
  QuestionnaireField,
  useQuestionnaireAutoSave,
} from './useQuestionnaireAutoSave';

interface NumberQuestionProps {
  fieldName: QuestionnaireField;
  schema: yup.Schema;
  question: string;
  helperText: string;
  /** Optional leading adornment rendered inside the input. */
  startAdornment?: React.ReactNode;
  /** Optional trailing adornment rendered inside the input. */
  endAdornment?: React.ReactNode;
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
  endAdornment,
}) => {
  const {
    error,
    helperText: errorText,
    ...fieldProps
  } = useQuestionnaireAutoSave({ fieldName, schema });

  return (
    <LabeledField
      label={question}
      required
      error={error}
      helperText={error ? errorText : helperText}
    >
      {(aria) => (
        <TextField
          required
          error={error}
          size="small"
          type="number"
          slotProps={{
            htmlInput: { min: 0, inputMode: 'numeric', ...aria },
            input: { startAdornment, endAdornment },
          }}
          {...fieldProps}
        />
      )}
    </LabeledField>
  );
};
