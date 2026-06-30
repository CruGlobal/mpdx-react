import React from 'react';
import { TextField } from '@mui/material';
import {
  CurrencyAdornment,
  PercentageAdornment,
} from 'src/components/HrTools/Shared/Adornments';
import {
  GoalSettingsFieldBaseProps,
  useGoalSettingsField,
} from './useGoalSettingsField';

export interface GoalSettingsNumberFieldProps
  extends GoalSettingsFieldBaseProps {
  /** Optional unit adornment */
  adornment?: 'currency' | 'percentage';
}

/** Numeric field bound to Formik, with an optional currency/percentage adornment. */
export const GoalSettingsNumberField: React.FC<
  GoalSettingsNumberFieldProps
> = ({ adornment, ...props }) => {
  const textFieldProps = useGoalSettingsField(props);

  return (
    <TextField
      {...textFieldProps}
      type="number"
      // `step="any"` so decimal amounts/percentages (e.g. $1,234.56, 7.5%) pass
      // the browser's native number validation
      inputProps={{
        ...textFieldProps.inputProps,
        min: 0,
        step: adornment ? 'any' : 1,
      }}
      InputProps={{
        ...textFieldProps.InputProps,
        ...(adornment === 'currency'
          ? { startAdornment: <CurrencyAdornment /> }
          : {}),
        ...(adornment === 'percentage'
          ? { endAdornment: <PercentageAdornment /> }
          : {}),
      }}
    />
  );
};
