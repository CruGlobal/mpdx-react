import React, { useMemo } from 'react';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Grid, IconButton, MenuItem, Tooltip } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { getCalculationYearTooltip } from '../../../../Shared/calculationYearTooltip';
import { useGoalCalculator } from '../../../Shared/GoalCalculatorContext';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';

export const SettingsCategory: React.FC = () => {
  const { t } = useTranslation();
  const { goalCalculationResult } = useGoalCalculator();
  const goalCalculation = goalCalculationResult.data?.goalCalculation;
  const createdAt = goalCalculation?.createdAt;
  const calculationsYear = goalCalculation?.calculationsYear;

  const validationSchema = useMemo(
    () =>
      yup.object({
        name: yup.string().required(t('Goal Name is a required field')),
        calculationsYear: yup
          .number()
          .integer()
          .required(t('Calculation Year is a required field')),
      }),
    [t],
  );

  // Years from the goal's creation year to the current year, newest first,
  // widened to always include the saved calculation year — converted goals can
  // carry a year outside that range, and the saved year must stay selectable.
  // Falls back to just the current year until the goal loads.
  const yearOptions = useMemo(() => {
    const currentYear = DateTime.local().year;
    const createdYear = createdAt
      ? DateTime.fromISO(createdAt).year
      : currentYear;
    const startYear = Math.min(
      createdYear || currentYear,
      calculationsYear ?? currentYear,
      currentYear,
    );
    const endYear = Math.max(currentYear, calculationsYear ?? currentYear);
    return Array.from(
      { length: endYear - startYear + 1 },
      (_, index) => endYear - index,
    );
  }, [createdAt, calculationsYear]);

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <AutosaveTextField
          fieldName="name"
          schema={validationSchema}
          label={t('Goal Name')}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 6,
        }}
      >
        <AutosaveTextField
          fieldName="calculationsYear"
          schema={validationSchema}
          select
          label={t('Calculation Year')}
          InputProps={{
            endAdornment: (
              <Tooltip title={getCalculationYearTooltip(t)}>
                <IconButton
                  size="small"
                  aria-label={t('About the calculation year')}
                  sx={{ mr: 2 }}
                >
                  <InfoOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          }}
        >
          {yearOptions.map((year) => (
            <MenuItem key={year} value={String(year)}>
              {year}
            </MenuItem>
          ))}
        </AutosaveTextField>
      </Grid>
    </Grid>
  );
};
