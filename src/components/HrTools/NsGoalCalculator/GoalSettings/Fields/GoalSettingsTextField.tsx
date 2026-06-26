import React from 'react';
import { TextField } from '@mui/material';
import {
  GoalSettingsFieldBaseProps,
  useGoalSettingsField,
} from './useGoalSettingsField';

/** Plain text field bound to Formik. */
export const GoalSettingsTextField: React.FC<GoalSettingsFieldBaseProps> = (
  props,
) => {
  const textFieldProps = useGoalSettingsField(props);

  return <TextField {...textFieldProps} />;
};
