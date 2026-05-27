import React, { useMemo } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { DesignationSupportSalaryType } from 'src/graphql/types.generated';
import { usePdsGoalAutoSave } from '../Shared/Autosave/usePdsGoalAutoSave';
import { useSaveField } from '../Shared/Autosave/useSaveField';

// Uses usePdsGoalAutoSave directly (not AutosaveTextField) so the onChange can
// atomically clear payRate alongside salaryOrHourly in a single mutation.
export const PayTypeField: React.FC = () => {
  const { t } = useTranslation();
  const saveField = useSaveField();
  const schema = useMemo(
    () =>
      yup.object({
        salaryOrHourly: yup
          .string()
          .required(t('Pay Type is a required field')),
      }),
    [t],
  );
  const {
    value,
    onChange: updateValidation,
    disabled,
    error,
    helperText: errorMessage,
  } = usePdsGoalAutoSave({ fieldName: 'salaryOrHourly', schema });

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      select
      label={t('Pay Type')}
      error={error}
      helperText={error ? errorMessage : t('Changing this clears Pay Rate.')}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        updateValidation(event as React.ChangeEvent<HTMLInputElement>);
        const newValue = event.target.value as DesignationSupportSalaryType;
        if (newValue !== value) {
          saveField({ salaryOrHourly: newValue, payRate: null });
        }
      }}
    >
      <MenuItem value={DesignationSupportSalaryType.Salaried}>
        {t('Salaried')}
      </MenuItem>
      <MenuItem value={DesignationSupportSalaryType.Hourly}>
        {t('Hourly')}
      </MenuItem>
    </TextField>
  );
};
