import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressChangeEmptyState } from './AddressChangeEmptyState/AddressChangeEmptyState';
import { useAddressChangeHistoryQuery } from './AddressChangeHistory.generated';
import { AddressChangeSummary } from './AddressChangeSummary/AddressChangeSummary';
import { AddressChangeTable } from './AddressChangeTable/AddressChangeTable';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { DateRange } from './helpers';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

export const ChangeHistoryAddresses: React.FC<ChangeHistoryAddressesProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [madeBy, setMadeBy] = useState<string | null>(null);

  const { data, previousData, loading, fetchMore } =
    useAddressChangeHistoryQuery({
      variables: {
        accountListId,
        startDate: dateRange?.startDate?.toISODate() ?? undefined,
        endDate: dateRange?.endDate?.toISODate() ?? undefined,
        madeBy: madeBy ? [madeBy] : undefined,
      },
    });
  const history = data?.addressChangeHistory;

  const loadMore = () => {
    if (!loading && history?.pageInfo.hasNextPage) {
      fetchMore({ variables: { after: history.pageInfo.endCursor } });
    }
  };
  const addressChanges = history?.nodes ?? [];
  const madeByOptions =
    (data ?? previousData)?.addressChangeHistory.madeByOptions ?? [];

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
          madeBy={madeBy}
          madeByOptions={madeByOptions}
          onMadeByChange={setMadeBy}
        />
        <ExportCsvButton disabled={!addressChanges.length} />
      </Box>
      <Box sx={{ mt: 2 }}>
        {loading && !data ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress data-testid="loading" />
          </Box>
        ) : history?.totalCount ? (
          <>
            <AddressChangeSummary
              changeCount={history.totalCount}
              partnerCount={history.contactIds.length}
              automaticCount={history.automaticCount}
              dateRange={dateRange}
            />
            <AddressChangeTable
              addressChanges={addressChanges}
              loadingMore={loading}
              onEndReached={loadMore}
              onHistoryClick={() => {}}
            />
          </>
        ) : (
          history && (
            <AddressChangeEmptyState filtered={!!dateRange || !!madeBy} />
          )
        )}
      </Box>
    </Box>
  );
};
