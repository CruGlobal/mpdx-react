import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressHistoryModal } from 'src/components/Shared/AddressHistoryModal/AddressHistoryModal';
import {
  ContactFilterChangedDuringEnum,
  DateRange,
  getChangedDuringRange,
} from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';
import {
  AddressChangeEmptyState,
  AddressChangeFilter,
} from './AddressChangeEmptyState/AddressChangeEmptyState';
import { useAddressChangeHistoryQuery } from './AddressChangeHistory.generated';
import { AddressChangeSummary } from './AddressChangeSummary/AddressChangeSummary';
import { AddressChangeTable } from './AddressChangeTable/AddressChangeTable';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { useExportAddressChanges } from './ExportCsvButton/useExportAddressChanges';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

const getEmptyStateFilter = (
  otherFilters: boolean,
  changedDuring: ContactFilterChangedDuringEnum | null,
): AddressChangeFilter => {
  if (otherFilters) {
    return 'other';
  }
  if (!changedDuring) {
    return 'none';
  }
  return changedDuring === ContactFilterChangedDuringEnum.Last12Months
    ? 'defaultRange'
    : 'other';
};

export const ChangeHistoryAddresses: React.FC<ChangeHistoryAddressesProps> = ({
  accountListId,
}) => {
  const { t } = useTranslation();
  const [partners, setPartners] = useState(
    ContactFilterPartnerEnum.GaveOneOrMore,
  );
  const [changedDuring, setChangedDuring] =
    useState<ContactFilterChangedDuringEnum | null>(
      ContactFilterChangedDuringEnum.Last12Months,
    );
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [failedPage, setFailedPage] = useState<string | null>(null);
  const [madeBy, setMadeBy] = useState<string | null>(null);
  const [historyContactId, setHistoryContactId] = useState<string | null>(null);
  const dateRange = getChangedDuringRange(changedDuring, customRange);
  const emptyStateFilter = getEmptyStateFilter(
    partners !== ContactFilterPartnerEnum.GaveOneOrMore || !!madeBy,
    changedDuring,
  );

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
    setChangedDuring(ContactFilterChangedDuringEnum.Custom);
  };

  const variables = {
    accountListId,
    partners,
    startDate: dateRange?.startDate?.toISODate() ?? undefined,
    endDate: dateRange?.endDate?.toISODate() ?? undefined,
    madeBy: madeBy ? [madeBy] : undefined,
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

  // A failed page never sets the query's error, so it is caught and shown here. The API's cursors are
  // offsets that repeat across filters, so the key includes the filters as well as the cursor.
  const pageKey = JSON.stringify([variables, history?.pageInfo.endCursor]);
  const loadMoreFailed = failedPage === pageKey;
  const fetchNextPage = () => {
    const failedKey = pageKey;
    setFailedPage(null);
    fetchMore({ variables: { after: history?.pageInfo.endCursor } }).catch(() =>
      setFailedPage(failedKey),
    );
  };
  const loadMore = () => {
    if (!loading && !loadMoreFailed && history?.pageInfo.hasNextPage) {
      fetchNextPage();
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
          partners={partners}
          onPartnersChange={setPartners}
          changedDuring={changedDuring}
          onChangedDuringChange={setChangedDuring}
          dateRange={customRange}
          onDateRangeChange={handleCustomRangeChange}
          madeBy={madeBy}
          madeByOptions={madeByOptions}
          onMadeByChange={setMadeBy}
        />
        <ExportCsvButton
          disabled={!addressChanges.length}
          exporting={exporting}
          onClick={startExport}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        {loading && !data ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress data-testid="loading" />
          </Box>
        ) : error && !data ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={retry}>
                {t('Retry')}
              </Button>
            }
          >
            {t('Unable to load address changes.')}
          </Alert>
        ) : history?.totalCount ? (
          <>
            <AddressChangeSummary
              changeCount={history.totalCount}
              partnerCount={history.contactIds.length}
              automaticCount={history.automaticCount}
              dateRange={dateRange}
            />
            {/* Above the table: the table has a fixed height, so anything below it is off screen */}
            {loadMoreFailed && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={fetchNextPage}
                    disabled={loading}
                  >
                    {t('Retry')}
                  </Button>
                }
              >
                {t('Unable to load more address changes.')}
              </Alert>
            )}
            <AddressChangeTable
              addressChanges={addressChanges}
              loadingMore={loading}
              onEndReached={loadMore}
              onHistoryClick={({ contactId }) => setHistoryContactId(contactId)}
            />
          </>
        ) : (
          history && <AddressChangeEmptyState filter={emptyStateFilter} />
        )}
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
