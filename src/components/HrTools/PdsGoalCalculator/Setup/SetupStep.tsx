import React, { useMemo } from 'react';
import CalculateIcon from '@mui/icons-material/Calculate';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Avatar,
  Box,
  Card,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import {
  CurrencyAdornment,
  PercentageAdornment,
} from '../../GoalCalculator/Shared/Adornments';
import { AutosaveTextField } from '../Shared/Autosave/AutosaveTextField';
import { useSaveField } from '../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { isSimpleFormType } from '../Shared/formType';
import { HoursPerWeekGrid } from './HoursPerWeekGrid/HoursPerWeekGrid';

export const SetupStep: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { calculation, hcmUser, setRightPanelContent } = usePdsGoalCalculator();
  const { data: userData } = useGetUserQuery();
  const schema = useMemo(
    () =>
      yup.object({
        formType: yup
          .string()
          .oneOf(Object.values(DesignationSupportFormType))
          .nullable()
          .optional(),
        name: yup.string().required(t('Goal Name is a required field')),
        status: yup
          .string()
          .required(t('Employment Status is a required field')),
        salaryOrHourly: yup
          .string()
          .required(t('Pay Type is a required field')),
        payRate: yup
          .number()
          .required(t('Pay Rate is a required field'))
          .positive(t('Pay Rate must be a positive number')),
        hoursWorkedPerWeek: yup.number().when('salaryOrHourly', {
          is: (val: string) => val !== DesignationSupportSalaryType.Salaried,
          then: (s) =>
            s
              .required(t('Hours Worked is a required field'))
              .positive(t('Hours Worked must be a positive number')),
          otherwise: (s) => s.optional().nullable(),
        }),
        benefits: yup.number().when('status', {
          is: (val: string) => val !== DesignationSupportStatus.PartTime,
          then: (s) =>
            s
              .required(t('Benefits is a required field'))
              .positive(t('Benefits must be a positive number')),
          otherwise: (s) => s.optional().nullable(),
        }),
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
  const isSimpleForm = isSimpleFormType(calculation?.formType);

  const payRateHelperText = isSalaried
    ? t('Enter yearly salary')
    : t('Enter hourly rate');

  const handleOpenHoursCalculator = () => {
    setRightPanelContent(
      <HoursPerWeekGrid
        onApply={(average) => {
          saveField({ hoursWorkedPerWeek: average });
        }}
      />,
    );
  };

  return (
    <>
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
        <Typography>
          {t('Take a moment to verify your information.')}
        </Typography>
      </Box>

      <Card sx={{ padding: theme.spacing(3) }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <Avatar
            src={userData?.user.avatar}
            alt={userData?.user.firstName ?? undefined}
            variant="rounded"
            sx={{ width: theme.spacing(4.5), height: theme.spacing(4.5) }}
          />
          <Typography data-testid="info-name-typography" variant="subtitle1">
            {userData?.user.firstName}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="formType"
              schema={schema}
              select
              label={t('Form Type')}
              helperText={t(
                'Default includes reimbursable expenses and 403b contributions; Simple omits them.',
              )}
            >
              <MenuItem value={DesignationSupportFormType.Detailed}>
                {t('Default')}
              </MenuItem>
              <MenuItem value={DesignationSupportFormType.Simple}>
                {t('Simple')}
              </MenuItem>
            </AutosaveTextField>
          </Grid>

          <Grid item xs={12}>
            <AutosaveTextField
              fieldName="status"
              schema={schema}
              select
              label={t('Employment Status')}
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
              label={t('Pay Type')}
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleOpenHoursCalculator}
                        aria-label={t('Open hours per week calculator')}
                        edge="end"
                        size="small"
                      >
                        <CalculateIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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

          {!isSimpleForm && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label={t('403b Contribution Percentage')}
                disabled
                value={
                  hcmUser?.fourOThreeB
                    ? (hcmUser.fourOThreeB
                        .currentTaxDeferredContributionPercentage ?? 0) +
                      (hcmUser.fourOThreeB.currentRothContributionPercentage ??
                        0)
                    : ''
                }
                helperText={t(
                  'Retrieved from Principal. A combined percentage of your current tax deferred and Roth contributions.',
                )}
                InputProps={{
                  endAdornment: <PercentageAdornment />,
                }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <Autocomplete
              options={locations}
              value={calculation?.geographicLocation ?? 'None'}
              onChange={(_, newValue: string | null) =>
                saveField({ geographicLocation: newValue })
              }
              disabled={!calculation}
              size="small"
              renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                  {...params}
                  label={t('Geographic Multiplier')}
                  helperText={t('If not applicable, select "None"')}
                />
              )}
            />
          </Grid>
        </Grid>
      </Card>
    </>
  );
};
