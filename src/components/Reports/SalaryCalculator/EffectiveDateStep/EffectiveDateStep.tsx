import React, { useMemo } from 'react';
import { Box, MenuItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import theme from 'src/theme';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';
import { DateOption, useEffectiveDateOptions } from './useEffectiveDateOptions';

export const EffectiveDateStep: React.FC = () => {
  const { t } = useTranslation();
  const dateOptions = useEffectiveDateOptions();

  const schema = useMemo(
    () =>
      yup.object({
        effectiveDate: yup
          .string()
          .required(t('Please select an effective date')),
      }),
    [t],
  );

  return (
    <Box py={theme.spacing(2)}>
      <Typography variant="h4" gutterBottom>
        {t('Effective Date')}
      </Typography>
      <Box mb={theme.spacing(4)} />
      <Typography paragraph>
        {t(
          'Please select the date of the paycheck you would like this change to first occur.',
        )}
      </Typography>
      <Box mb={theme.spacing(2)} />
      <Typography paragraph>
        {t(
          'The earliest effective date will be the next paycheck date (if no additional approvals are required). Please note that at the end of each calendar year, there may be a period during which effective dates for the new calendar year are not available. In such cases you will need to return later to submit the form.',
        )}
      </Typography>
      <Box mb={theme.spacing(4)} />
      <Box maxWidth={260}>
        <AutosaveTextField
          select
          fieldName="effectiveDate"
          schema={schema}
          label={t('Select a future date')}
          required
          SelectProps={{
            MenuProps: {
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            },
          }}
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
