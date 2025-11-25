import React, { useMemo } from 'react';
import { Box, MenuItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import theme from 'src/theme';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

interface DateOption {
  value: string;
  label: string;
}

export const EffectiveDateStep: React.FC = () => {
  const { t } = useTranslation();
  const { hcm } = useSalaryCalculator();

  const schema = useMemo(
    () =>
      yup.object({
        effectiveDate: yup
          .string()
          .required(t('Please select an effective date')),
      }),
    [t],
  );

  const dateOptions = useMemo(() => {
    // TODO: Add effectiveDates field to HCM GraphQL query
    // @ts-expect-error - effectiveDates field doesn't exist yet in HCM type
    const effectiveDates = hcm?.effectiveDates;
    if (!effectiveDates) {
      return [];
    }

    return effectiveDates.map((dateString: string) => {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return {
        value: dateString,
        label: formattedDate,
      };
    });
    // @ts-expect-error - effectiveDates field doesn't exist yet in HCM type
  }, [hcm?.effectiveDates]);

  return (
    <Box px={theme.spacing(3)} py={theme.spacing(2)}>
      <Typography variant="h5" gutterBottom>
        {t('Effective Date')}
      </Typography>
      <Box mb={theme.spacing(4)} />
      <Typography paragraph>
        {t(
          'Please select the date of the paycheck you would like this change to first occur.',
        )}
      </Typography>
      <Box mb={2} />
      <Typography paragraph>
        {t(
          'The earliest effective date will be the next paycheck date (if no additional approvals are required). Please note that at the end of each calendar year, there may be a period during which effective dates for the new calendar year are not available. In such cases you will need to return later to submit the form.',
        )}
      </Typography>
      <Box mb={4} />
      <Box>
        <AutosaveTextField
          select
          fieldName="effectiveDate"
          schema={schema}
          label={t('Select a future date')}
          required
        >
          {dateOptions.map((option: DateOption) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </AutosaveTextField>
      </Box>
    </Box>
  );
};
