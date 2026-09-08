import React from 'react';
import { TextField } from '@mui/material';

export interface GoalSettingsReadOnlyFieldProps {
  /** Visible MUI label when `showLabel` is set, otherwise the input's `aria-label`. */
  label: string;
  value: string;
  /** Render `label` as a visible floating label instead of an `aria-label`. */
  showLabel?: boolean;
}

/** Deliberately not Formik-bound, so it never feeds the updateNewStaffGoalCalculation mutation. */
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
