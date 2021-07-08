import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from './Header/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './Table/ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from './Empty/ExpectedMonthlyTotalReportEmpty';
import { useGetExpectedMonthlyTotalsQuery } from 'pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import Loading from 'src/components/Loading';

interface Props {
  accountListId: string;
}

export const ExpectedMonthlyTotalReport: React.FC<Props> = ({
  accountListId,
}) => {
  const { t } = useTranslation();

  const { data, loading, error } = useGetExpectedMonthlyTotalsQuery({
    variables: { accountListId },
  });

  const receivedDonations =
    data?.expectedMonthlyTotalReport.received.donations || [];

  const likelyDonations =
    data?.expectedMonthlyTotalReport.likely.donations || [];

  const unlikelyDonations =
    data?.expectedMonthlyTotalReport.unlikely.donations || [];

  const receivedCount = receivedDonations.length;

  const likelyCount = likelyDonations.length;

  const unlikelyCount = unlikelyDonations.length;

  const isEmpty = receivedCount + likelyCount + unlikelyCount === 0;

  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader empty={isEmpty} />
      {loading ? (
        <Loading loading />
      ) : !isEmpty ? (
        <>
          <ExpectedMonthlyTotalReportTable
            title={t('Donations So Far This Month')}
            data={receivedDonations}
            donations={true}
          />
          <ExpectedMonthlyTotalReportTable
            title={t('Likely Partners This Month')}
            data={likelyDonations}
            donations={false}
          />
          <ExpectedMonthlyTotalReportTable
            title={t('Possible Partners This Month')}
            data={unlikelyDonations}
            donations={false}
          />
        </>
      ) : (
        <ExpectedMonthlyTotalReportEmpty />
      )}
    </Box>
  );
};
