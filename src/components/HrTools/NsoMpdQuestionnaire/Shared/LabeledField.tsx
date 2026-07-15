import React, { useId } from 'react';
import { FormControl, FormHelperText, FormLabel } from '@mui/material';

interface LabeledFieldProps {
  label: React.ReactNode;
  required?: boolean;
  error?: boolean;
  helperText?: React.ReactNode;
  /**
   * Renders the control, wiring the supplied aria attributes onto its focusable element so the
   * control's accessible name is the label text (matching the RadioQuestion pattern).
   */
  children: (aria: {
    'aria-labelledby': string;
    'aria-describedby': string | undefined;
  }) => React.ReactNode;
}

/**
 * Renders a question's text as a wrapping FormLabel block above its control, with optional helper
 * text below. Keeps long question text from truncating the way a floating MUI input label does.
 */
export const LabeledField: React.FC<LabeledFieldProps> = ({
  label,
  required,
  error,
  helperText,
  children,
}) => {
  const labelId = useId();
  const helperTextId = useId();

  return (
    <FormControl error={error} required={required}>
      <FormLabel component="span" id={labelId} sx={{ color: 'text.primary' }}>
        {label}
      </FormLabel>
      {children({
        'aria-labelledby': labelId,
        'aria-describedby': helperText ? helperTextId : undefined,
      })}
      {helperText && (
        <FormHelperText id={helperTextId}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};
