import React from 'react';
import { RadioGroup } from '@mui/material';
import * as yup from 'yup';
import { DescribedRadioOption } from 'src/components/HrTools/Shared/DescribedRadioOption';
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

  const hasDescriptions = options.some((option) => option.description);

  return (
    <LabeledField label={label} required error={error} helperText={helperText}>
      {(aria) => (
        <RadioGroup
          row={row}
          sx={{ paddingInline: 2, gap: hasDescriptions ? 2 : 0 }}
          aria-required
          {...aria}
          {...fieldProps}
        >
          {options.map((option) => (
            <DescribedRadioOption key={option.value} {...option} />
          ))}
        </RadioGroup>
      )}
    </LabeledField>
  );
};
