import React, { useState } from 'react';
import { Box, MenuItem, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import theme from 'src/theme';

const dateRangeOptions = [
  { value: 'next_paycheck', label: 'Next Paycheck Date' },
  { value: 'first_of_month', label: 'First of Next Month' },
  { value: 'custom_date', label: 'Custom Date' },
];

export const EffectiveDateStep: React.FC = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState('');

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
        <TextField
          select
          label={t('Select a future date')}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          fullWidth
          variant="outlined"
        >
          {dateRangeOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {t(option.label)}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};
