import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { DateRange } from './helpers';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

export const ChangeHistoryAddresses: React.FC<
  ChangeHistoryAddressesProps
> = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {t('Address changes')}
        </Typography>
        <Typography color="text.secondary">
          {t(
            'Every address change for your partners, including automatic updates from US Donation Services and DonorHub.',
          )}
        </Typography>
        <Typography color="text.secondary">
          {t('Check here before you send a newsletter or make calls.')}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <AddressFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <ExportCsvButton />
      </Box>
    </Box>
  );
};
