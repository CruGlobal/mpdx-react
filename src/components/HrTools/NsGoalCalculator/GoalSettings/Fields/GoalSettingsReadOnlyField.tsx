import React from 'react';
import { TextField } from '@mui/material';

export interface GoalSettingsReadOnlyFieldProps {
  /**
   * Field label. Used as the visible MUI label when `showLabel` is set,
   * otherwise as the input's `aria-label` (matching the `FieldRow` Category
   * column that already shows it).
   */
  label: string;
  /** Value to display. */
  value: string;
  /** Render `label` as a visible floating label instead of an `aria-label`. */
  showLabel?: boolean;
}

/**
 * A Goal Settings field the admin view shows but never edits, because it is
 * owned elsewhere (the attendee, or OneApp). It is intentionally NOT bound to
 * Formik, so it never feeds the `updateNewStaffGoalCalculation` mutation.
 */
export const GoalSettingsReadOnlyField: React.FC<
  GoalSettingsReadOnlyFieldProps
> = ({ label, value, showLabel }) => (
  <TextField
    size="small"
    variant="outlined"
    fullWidth
    disabled
    value={value}
    {...(showLabel ? { label } : { inputProps: { 'aria-label': label } })}
  />
);
