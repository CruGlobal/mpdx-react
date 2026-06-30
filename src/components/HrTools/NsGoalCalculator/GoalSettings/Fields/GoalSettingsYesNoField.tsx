import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  GoalSettingsFieldBaseProps,
  useGoalSettingsField,
} from './useGoalSettingsField';

/**
 * Yes/No dropdown bound to Formik.
 */
export const GoalSettingsYesNoField: React.FC<GoalSettingsFieldBaseProps> = (
  props,
) => {
  const { t } = useTranslation();
  const textFieldProps = useGoalSettingsField(props);

  return (
    <TextField {...textFieldProps} select>
      <MenuItem value="false">{t('No')}</MenuItem>
      <MenuItem value="true">{t('Yes')}</MenuItem>
    </TextField>
  );
};
