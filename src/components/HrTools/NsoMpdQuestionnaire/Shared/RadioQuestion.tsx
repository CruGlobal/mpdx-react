import React, { useId } from 'react';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import * as yup from 'yup';
import { LabeledField } from './LabeledField';
import {
  QuestionnaireField,
  useQuestionnaireAutoSave,
} from './useQuestionnaireAutoSave';

export interface RadioOption {
  value: string;
  label: string;
  /** Shown under the label in muted text to clarify what the option means. */
  description?: string;
}

interface RadioQuestionProps {
  fieldName: QuestionnaireField;
  schema: yup.Schema;
  label: string;
  options: RadioOption[];
  /** Lay the options out horizontally instead of stacked. */
  row?: boolean;
}

// Matches the Radio's own padding so the first label line lines up with the circle.
const radioPadding = '9px';

const RadioQuestionOption: React.FC<{ option: RadioOption }> = ({ option }) => {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <FormControlLabel
      value={option.value}
      control={
        <Radio
          inputProps={{
            'aria-labelledby': labelId,
            'aria-describedby': option.description ? descriptionId : undefined,
          }}
        />
      }
      disableTypography
      label={
        <Box sx={{ paddingBlock: radioPadding }}>
          <Typography id={labelId} component="span" display="block">
            {option.label}
          </Typography>
          {option.description && (
            <Typography
              id={descriptionId}
              component="span"
              display="block"
              variant="caption"
              color="text.secondary"
            >
              {option.description}
            </Typography>
          )}
        </Box>
      }
      sx={{ alignItems: 'flex-start' }}
    />
  );
};

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
  const { error, helperText, ...fieldProps } = useQuestionnaireAutoSave({
    fieldName,
    schema,
    saveOnChange: true,
  });

  return (
    <LabeledField label={label} required error={error} helperText={helperText}>
      {(aria) => (
        <RadioGroup
          row={row}
          sx={{ paddingInline: 2 }}
          aria-required
          {...aria}
          {...fieldProps}
        >
          {options.map((option) => (
            <RadioQuestionOption key={option.value} option={option} />
          ))}
        </RadioGroup>
      )}
    </LabeledField>
  );
};
