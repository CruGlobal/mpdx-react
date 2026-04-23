import React, { useEffect, useMemo, useState } from 'react';
import { Box, MenuItem, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import theme from 'src/theme';
import { AutosaveTextField } from '../Autosave/AutosaveTextField';
import { EffectiveDateBanner } from './EffectiveDateBanner/EffectiveDateBanner';
import { useEffectiveDateOptions } from './useEffectiveDateOptions';

export const EffectiveDateStep: React.FC = () => {
  const { t } = useTranslation();
  const dateOptions = useEffectiveDateOptions();

  const shouldShowBanner = useMemo(() => {
    if (dateOptions.length === 0) {
      return false;
    }

    const now = DateTime.now();
    const currentYear = now.year;
    const bannerStartDate = DateTime.fromObject({
      year: currentYear,
      month: 11,
      day: 20,
    });

    if (now < bannerStartDate) {
      return false;
    }

    const nextYear = currentYear + 1;
    const hasNextYearDates = dateOptions.some((option) => {
      const date = DateTime.fromISO(option.value);
      return date.year === nextYear;
    });

    return !hasNextYearDates;
  }, [dateOptions]);

  const [showAlert, setShowAlert] = useState(shouldShowBanner);

  useEffect(() => {
    setShowAlert(shouldShowBanner);
  }, [shouldShowBanner]);

  const schema = useMemo(
    () =>
      yup.object({
        effectiveDate: yup
          .string()
          .oneOf(
            dateOptions.map((option) => option.value),
            t('Please choose an effective date from the list'),
          )
          .required(t('Please select an effective date')),
      }),
    [t, dateOptions],
  );

  return (
    <Box py={theme.spacing(2)}>
      {showAlert && <EffectiveDateBanner onClose={() => setShowAlert(false)} />}
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
          label={t('Effective date')}
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
          {dateOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </AutosaveTextField>
      </Box>
    </Box>
  );
};
