import React, { ReactElement } from 'react';
import { MenuItem, TextField } from '@mui/material';
import {
  GoalSettingsFieldBaseProps,
  useGoalSettingsField,
} from './useGoalSettingsField';

export interface SelectOption {
  value: string;
  label: string;
}

export interface GoalSettingsSelectProps extends GoalSettingsFieldBaseProps {
  options: SelectOption[];
}

/** Single-select dropdown bound to Formik. */
export const GoalSettingsSelect: React.FC<GoalSettingsSelectProps> = ({
  options,
  ...props
}) => {
  const textFieldProps = useGoalSettingsField(props);

  return (
    <TextField {...textFieldProps} select>
      {options.map(
        (option): ReactElement => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ),
      )}
    </TextField>
  );
};
