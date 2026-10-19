import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressChangeEmptyState } from './AddressChangeEmptyState/AddressChangeEmptyState';
import { AddressChangeSummary } from './AddressChangeSummary/AddressChangeSummary';
import { AddressChangeTable } from './AddressChangeTable/AddressChangeTable';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { mockAddressChanges } from './ChangeHistoryAddressesMock';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { DateRange, isAutomaticChange } from './helpers';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

export const ChangeHistoryAddresses: React.FC<
  ChangeHistoryAddressesProps
> = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  const addressChanges = mockAddressChanges;
  const partnerCount = new Set(addressChanges.map(({ contactId }) => contactId))
    .size;
  const automaticCount = addressChanges.filter(({ source }) =>
    isAutomaticChange(source),
  ).length;

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
        <ExportCsvButton disabled={!addressChanges.length} />
      </Box>
      <Box sx={{ mt: 2 }}>
        {addressChanges.length ? (
          <>
            <AddressChangeSummary
              changeCount={addressChanges.length}
              partnerCount={partnerCount}
              automaticCount={automaticCount}
              dateRange={dateRange}
            />
            <AddressChangeTable
              addressChanges={addressChanges}
              onHistoryClick={() => {}}
            />
          </>
        ) : (
          <AddressChangeEmptyState filtered={!!dateRange} />
        )}
      </Box>
    </Box>
  );
};
