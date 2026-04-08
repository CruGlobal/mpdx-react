import React, { useMemo } from 'react';
import {
  Autocomplete,
  Box,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CurrencyAdornment } from 'src/components/Reports/GoalCalculator/Shared/Adornments';
import { AutosaveForm } from 'src/components/Shared/Autosave/AutosaveForm';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { AutosaveTextField } from './Autosave/AutosaveTextField';
import { useSaveField } from './Autosave/useSaveField';

export const SetupForm: React.FC = () => {
  const { t } = useTranslation();
  const { calculation } = usePdsGoalCalculator();

  const schema = useMemo(
    () =>
      yup.object({
        name: yup.string().required(t('Goal Name is a required field')),
        status: yup.string().nullable(),
        salaryOrHourly: yup.string().nullable(),
        payRate: yup
          .number()
          .nullable()
          .min(0, t('Pay Rate must be a positive number')),
        hoursWorkedPerWeek: yup
          .number()
          .nullable()
          .min(0, t('Hours Worked must be a positive number')),
        benefits: yup
          .number()
          .nullable()
          .min(0, t('Benefits must be a positive number')),
      }),
    [t],
  );
  const { goalGeographicConstantMap } = useGoalCalculatorConstants();
  const saveField = useSaveField();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const isSalaried =
    calculation?.salaryOrHourly === DesignationSupportSalaryType.Salaried;
  const isPartTime = calculation?.status === DesignationSupportStatus.PartTime;

  const payRateHelperText = isSalaried
    ? t('Enter yearly salary')
    : t('Enter hourly rate');

  return (
    <AutosaveForm>
      <Box pb={4}>
        <Typography variant="h6">{t('Settings')}</Typography>
        <Typography pt={1}>
          {t('What do you want to call this goal?')}
        </Typography>
      </Box>
      <AutosaveTextField
        fieldName="name"
        schema={schema}
        label={t('Goal Name')}
      />

      <Divider sx={{ my: 4, mx: -4 }} />

      <Box pb={4}>
        <Typography variant="h6">{t('Calculator Setup')}</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutosaveTextField
            fieldName="status"
            schema={schema}
            select
            label={t('Status')}
          >
            <MenuItem value={DesignationSupportStatus.FullTime}>
              {t('Full-time')}
            </MenuItem>
            <MenuItem value={DesignationSupportStatus.PartTime}>
              {t('Part-time')}
            </MenuItem>
          </AutosaveTextField>
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName="salaryOrHourly"
            schema={schema}
            select
            label={t('Salaried/Hourly')}
          >
            <MenuItem value={DesignationSupportSalaryType.Salaried}>
              {t('Salaried')}
            </MenuItem>
            <MenuItem value={DesignationSupportSalaryType.Hourly}>
              {t('Hourly')}
            </MenuItem>
          </AutosaveTextField>
        </Grid>

        <Grid item xs={12}>
          <AutosaveTextField
            fieldName="payRate"
            schema={schema}
            label={t('Pay Rate')}
            type="number"
            helperText={payRateHelperText}
            InputProps={{
              startAdornment: <CurrencyAdornment />,
            }}
          />
        </Grid>

        {!isSalaried && (
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="hoursWorkedPerWeek"
              schema={schema}
              label={t('Hours Worked')}
              type="number"
              helperText={t('Estimate of hours worked per week')}
            />
          </Grid>
        )}

        {!isPartTime && (
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="benefits"
              schema={schema}
              label={t('Benefits')}
              type="number"
              helperText={t('Enter monthly benefits charge')}
              InputProps={{
                startAdornment: <CurrencyAdornment />,
              }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            label={t('403b Contribution Percentage')}
            disabled
            helperText={t('Retrieved from Principal')}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            options={locations}
            value={calculation?.geographicLocation ?? 'None'}
            onChange={(_, newValue) =>
              saveField({ geographicLocation: newValue })
            }
            disabled={!calculation}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('Geographic Multiplier')}
                helperText={t(
                  'If not applicable, select "None"',
                )}
              />
            )}
          />
        </Grid>
      </Grid>
    </AutosaveForm>
  );
};
