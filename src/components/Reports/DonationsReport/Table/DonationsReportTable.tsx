import React, { useMemo } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Divider, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import { useTranslation } from 'react-i18next';
import { DonationTable } from 'src/components/DonationTable/DonationTable';
import { useContactLinks } from 'src/hooks/useContactLinks';
import { useLocale } from 'src/hooks/useLocale';
import { EmptyDonationsTable } from '../../../common/EmptyDonationsTable/EmptyDonationsTable';

interface DonationReportTableProps {
  accountListId: string;
  designationAccounts?: string[];
  time: DateTime;
  setTime: (time: DateTime) => void;
}

export const DonationsReportTable: React.FC<DonationReportTableProps> = ({
  accountListId,
  designationAccounts,
  time,
  setTime,
}) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { getContactUrl } = useContactLinks({
    url: `/accountLists/${accountListId}/reports/donations/`,
  });

  const startDate = time.toISODate();
  const endDate = time.plus({ months: 1 }).minus({ days: 1 }).toISODate();

  const title = time.toJSDate().toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const hasNext = time.hasSame(DateTime.now().startOf('month'), 'month');

  const setPrevMonth = () => {
    setTime(time.minus({ months: 1 }));
  };

  const setNextMonth = () => {
    setTime(time.plus({ months: 1 }));
  };

  const query = useMemo(
    () => ({
      startDate,
      endDate,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    }),
    [startDate, endDate, designationAccounts],
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          margin: 1,
          gap: 2,
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Button
          style={{ marginLeft: 'auto', maxHeight: 35 }}
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          size="small"
          onClick={() => setPrevMonth()}
        >
          {t('Previous Month')}
        </Button>
        <Button
          style={{ maxHeight: 35 }}
          variant="contained"
          endIcon={<ChevronRightIcon />}
          size="small"
          onClick={() => setNextMonth()}
          disabled={hasNext}
        >
          {t('Next Month')}
        </Button>
      </Box>
      <Divider style={{ margin: 12 }} variant="middle" />
      <DonationTable
        accountListId={accountListId}
        filter={query}
        getContactUrl={getContactUrl}
        visibleColumnsStorageKey="donations-report-table"
        emptyPlaceholder={
          <EmptyDonationsTable
            title={t('No donations received in {{month}} {{year}}', {
              month: time.monthLong,
              year: time.year,
            })}
          />
        }
      />
    </>
  );
};
