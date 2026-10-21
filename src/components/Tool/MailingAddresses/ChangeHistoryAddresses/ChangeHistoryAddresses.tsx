import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AddressHistoryModal } from 'src/components/Shared/AddressHistoryModal/AddressHistoryModal';
import {
  ContactFilterChangedDuringEnum,
  DateRange,
  getChangedDuringRange,
} from 'src/components/Shared/Filters/ChangedDuring/changedDuring';
import { ContactFilterPartnerEnum } from 'src/graphql/types.generated';
import { AddressChangeEmptyState } from './AddressChangeEmptyState/AddressChangeEmptyState';
import { useAddressChangeHistoryQuery } from './AddressChangeHistory.generated';
import { AddressChangeSummary } from './AddressChangeSummary/AddressChangeSummary';
import { AddressChangeTable } from './AddressChangeTable/AddressChangeTable';
import { AddressFilters } from './AddressFilters/AddressFilters';
import { ExportCsvButton } from './ExportCsvButton/ExportCsvButton';
import { useExportAddressChanges } from './ExportCsvButton/useExportAddressChanges';

interface ChangeHistoryAddressesProps {
  accountListId: string;
}

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
  const [madeBy, setMadeBy] = useState<string | null>(null);
  const [historyContactId, setHistoryContactId] = useState<string | null>(null);
  const dateRange = getChangedDuringRange(changedDuring, customRange);
  const filtered =
    partners !== ContactFilterPartnerEnum.GaveOneOrMore ||
    !!dateRange ||
    !!madeBy;

  const handleCustomRangeChange = (range: DateRange) => {
    setCustomRange(range);
    setChangedDuring(ContactFilterChangedDuringEnum.Custom);
  };

  const { data, previousData, loading, error, fetchMore } =
    useAddressChangeHistoryQuery({
      variables: {
        accountListId,
        partners,
        startDate: dateRange?.startDate?.toISODate() ?? undefined,
        endDate: dateRange?.endDate?.toISODate() ?? undefined,
        madeBy: madeBy ? [madeBy] : undefined,
      },
    });
  const history = data?.addressChangeHistory;

  const { exporting, startExport } = useExportAddressChanges({
    history,
    fetchMore,
    error,
  });

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
              onHistoryClick={({ contactId }) => setHistoryContactId(contactId)}
            />
          </>
        ) : (
          history && <AddressChangeEmptyState filtered={filtered} />
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
