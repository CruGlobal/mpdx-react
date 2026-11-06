import React from 'react';
import { ApolloError } from '@apollo/client';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import {
  AddressChangeEmptyState,
  AddressChangeFilter,
} from '../AddressChangeEmptyState/AddressChangeEmptyState';
import { AddressChangeHistoryQuery } from '../AddressChangeHistory.generated';
import { AddressChangeSummary } from '../AddressChangeSummary/AddressChangeSummary';
import { AddressChangeTable } from '../AddressChangeTable/AddressChangeTable';
import { AddressChangeRow } from '../helpers';

interface ChangeHistoryResultsProps {
  hasData: boolean;
  loading: boolean;
  error: ApolloError | undefined;
  onRetry: () => void;
  history: AddressChangeHistoryQuery['addressChangeHistory'] | undefined;
  dateRange: DateRange | null;
  emptyStateFilter: AddressChangeFilter;
  loadMoreFailed: boolean;
  onRetryLoadMore: () => void;
  onEndReached: () => void;
  onHistoryClick: (addressChange: AddressChangeRow) => void;
}

export const ChangeHistoryResults: React.FC<ChangeHistoryResultsProps> = ({
  hasData,
  loading,
  error,
  onRetry,
  history,
  dateRange,
  emptyStateFilter,
  loadMoreFailed,
  onRetryLoadMore,
  onEndReached,
  onHistoryClick,
}) => {
  const { t } = useTranslation();

  if (loading && !hasData) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress data-testid="loading" />
      </Box>
    );
  }
  if (error && !hasData) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            {t('Retry')}
          </Button>
        }
      >
        {t('Unable to load address changes.')}
      </Alert>
    );
  }
  if (!history) {
    return null;
  }
  if (!history.totalCount) {
    return <AddressChangeEmptyState filter={emptyStateFilter} />;
  }

  return (
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
              onClick={onRetryLoadMore}
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
        addressChanges={history.nodes}
        loadingMore={loading}
        onEndReached={onEndReached}
        onHistoryClick={onHistoryClick}
      />
    </>
  );
};
