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
import {
  CurrencyAdornment,
  PercentageAdornment,
} from 'src/components/HrTools/Shared/Adornments';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import { useGoalCalculatorConstants } from 'src/hooks/useGoalCalculatorConstants';
import { useLocale } from 'src/hooks/useLocale';
import { percentageFormat } from 'src/lib/intlFormat';
import { AutosaveTextField } from '../Shared/Autosave/AutosaveTextField';
import { useSaveField } from '../Shared/Autosave/useSaveField';
import { usePdsGoalCalculator } from '../Shared/PdsGoalCalculatorContext';
import { HoursPerWeekGrid } from './HoursPerWeekGrid/HoursPerWeekGrid';
import { PayTypeField } from './PayTypeField';

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
        benefits: yup
          .number()
          .nullable()
          .positive(t('Benefits must be a positive number')),
      }),
    [t],
  );
  const { goalGeographicConstantMap } = useGoalCalculatorConstants();
  const saveField = useSaveField();
  const locale = useLocale();

  const locations = useMemo(
    () => Array.from(goalGeographicConstantMap.keys()),
    [goalGeographicConstantMap],
  );

  const getLocationLabel = (location: string) => {
    const multiplier = goalGeographicConstantMap.get(location);
    if (multiplier === undefined || multiplier === 0) {
      return location;
    }
    return `${location} (${percentageFormat(multiplier, locale)})`;
  };

  const payType = calculation?.salaryOrHourly;
  const isSalaried = payType === DesignationSupportSalaryType.Salaried;
  const isPartTime = calculation?.status === DesignationSupportStatus.PartTime;
  const isSimpleForm =
    calculation?.formType === DesignationSupportFormType.Simple;

  const fourOThreeB = hcmUser?.fourOThreeB;
  const totalFourOThreeBContributionPercentage = fourOThreeB
    ? (fourOThreeB.currentTaxDeferredContributionPercentage ?? 0) +
      (fourOThreeB.currentRothContributionPercentage ?? 0)
    : '';

  const payRateHelperText = isSalaried
    ? t('Enter yearly salary')
    : t('Enter hourly rate');
  const payRateLabel = isSalaried ? t('Annual Pay Rate') : t('Hourly Pay Rate');
  const payRateUnitSuffix = isSalaried ? t('per year') : t('per hour');

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

      <Divider sx={{ mx: -4, my: 4 }} />

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
              helperText={
                <>
                  <Box component="span" display="block">
                    {t(
                      'Default includes reimbursable expenses and 403b contributions in the goal total.',
                    )}
                  </Box>
                  <Box component="span" display="block">
                    {t(
                      'Simple excludes them; existing entries are preserved and will count again if you switch back.',
                    )}
                  </Box>
                </>
              }
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
            <PayTypeField />
          </Grid>

          {payType && (
            <Grid item xs={12}>
              <AutosaveTextField
                fieldName="payRate"
                schema={schema}
                label={payRateLabel}
                type="number"
                helperText={payRateHelperText}
                InputProps={{
                  startAdornment: <CurrencyAdornment />,
                  endAdornment: (
                    <InputAdornment position="end">
                      {payRateUnitSuffix}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          )}

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
                value={totalFourOThreeBContributionPercentage}
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
              getOptionLabel={getLocationLabel}
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
      <Divider sx={{ mx: -4, my: 4 }} />
    </>
  );
};
