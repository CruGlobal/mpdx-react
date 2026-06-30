import React from 'react';
import { TextField } from '@mui/material';

export interface GoalSettingsPlaceholderProps {
  /**
   * Field label. Used as the visible MUI label when `showLabel` is set,
   * otherwise as the input's `aria-label` (matching the `FieldRow` Category
   * column that already shows it).
   */
  label: string;
  /** Hard-coded display value shown until the field is wired to real data. */
  value: string;
  /** Render `label` as a visible floating label instead of an `aria-label`. */
  showLabel?: boolean;
}

/**
 * Read-only stand-in for a Goal Settings field that has no API source yet.
 * It is intentionally NOT bound to Formik, so it never feeds the
 * `updateNewStaffGoalCalculation` mutation. Replace each usage with a real
 * field once the API exposes the data (see the `TODO`s at the call sites).
 */
export const GoalSettingsPlaceholder: React.FC<
  GoalSettingsPlaceholderProps
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
