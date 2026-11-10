import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressHistoryModal } from 'src/components/Shared/AddressHistoryModal/AddressHistoryModal';
import {
  AddressChangeHistoryQueryVariables,
  useAddressChangeHistoryQuery,
} from './AddressChangeHistory.generated';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { ChangeHistoryResults } from './ChangeHistoryResults/ChangeHistoryResults';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { useExportAddressChanges } from './ExportCsvButton/useExportAddressChanges';
import { useAddressChangeFilters } from './useAddressChangeFilters';
import { useLoadMoreAddressChanges } from './useLoadMoreAddressChanges';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

const ChangeHistoryIntro: React.FC = () => {
  const { t } = useTranslation();

  return (
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
  );
};

export const ChangeHistoryAddresses: React.FC<ChangeHistoryAddressesProps> = ({
  accountListId,
}) => {
  const filters = useAddressChangeFilters();
  const [historyContactId, setHistoryContactId] = useState<string | null>(null);

  const variables: AddressChangeHistoryQueryVariables = {
    accountListId,
    partners: filters.partners,
    startDate: filters.dateRange?.startDate?.toISODate() ?? undefined,
    endDate: filters.dateRange?.endDate?.toISODate() ?? undefined,
    madeBy: filters.madeBy ? [filters.madeBy] : undefined,
  };
  const { data, previousData, loading, error, fetchMore, refetch } =
    useAddressChangeHistoryQuery({ variables });
  const retry = () =>
    refetch().catch(() => {
      // Nothing to add: the error link already reports the failure, and `error` keeps the Alert up
    });
  const history = data?.addressChangeHistory;

  const { exporting, startExport } = useExportAddressChanges({
    history,
    fetchMore,
    error,
  });
  const { loadMoreFailed, fetchNextPage, loadMore } = useLoadMoreAddressChanges(
    { variables, history, loading, fetchMore },
  );
  const madeByOptions =
    (data ?? previousData)?.addressChangeHistory.madeByOptions ?? [];

  return (
    <Box>
      <ChangeHistoryIntro />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <AddressFilters
          partners={filters.partners}
          onPartnersChange={filters.setPartners}
          changedDuring={filters.changedDuring}
          onChangedDuringChange={filters.setChangedDuring}
          dateRange={filters.customRange}
          onDateRangeChange={filters.handleCustomRangeChange}
          madeBy={filters.madeBy}
          madeByOptions={madeByOptions}
          onMadeByChange={filters.setMadeBy}
        />
        <ExportCsvButton
          disabled={!history?.nodes.length}
          exporting={exporting}
          onClick={startExport}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <ChangeHistoryResults
          hasData={!!data}
          loading={loading}
          error={error}
          onRetry={retry}
          history={history}
          dateRange={filters.dateRange}
          emptyStateFilter={filters.emptyStateFilter}
          loadMoreFailed={loadMoreFailed}
          onRetryLoadMore={fetchNextPage}
          onEndReached={loadMore}
          onHistoryClick={({ contactId }) => setHistoryContactId(contactId)}
        />
      </Box>
      {historyContactId && (
        <AddressHistoryModal
          accountListId={accountListId}
          contactId={historyContactId}
          handleClose={() => setHistoryContactId(null)}
        />
      )}
    </Box>
  );
};
