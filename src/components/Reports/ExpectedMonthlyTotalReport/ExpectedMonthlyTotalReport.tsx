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

  const { received, likely, unlikely, currency } =
    data?.expectedMonthlyTotalReport || {};
  const receivedDonations = received?.donations || [];

  const likelyDonations = likely?.donations || [];

  const unlikelyDonations = unlikely?.donations || [];

  const receivedCount = receivedDonations.length;

  const likelyCount = likelyDonations.length;

  const unlikelyCount = unlikelyDonations.length;

  const isEmpty = receivedCount + likelyCount + unlikelyCount === 0;

  const totalDonations = received?.total || 0;

  const totalLikely = likely?.total || 0;

  const totalUnlikely = unlikely?.total || 0;

  const totalAmount = totalDonations + totalLikely + totalUnlikely;

  const totalCurrency = currency || 'USD';

  return (
    <Box>
      <ExpectedMonthlyTotalReportHeader
        empty={isEmpty}
        totalDonations={totalDonations}
        totalLikely={totalLikely}
        totalUnlikely={totalUnlikely}
        total={totalAmount}
        currency={totalCurrency}
      />
      {loading ? (
        <Loading loading />
      ) : !isEmpty ? (
        <>
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Donations So Far This Month')}
            data={receivedDonations}
            donations={true}
            total={totalDonations}
            currency={totalCurrency}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Likely Partners This Month')}
            data={likelyDonations}
            donations={false}
            total={totalLikely}
            currency={totalCurrency}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={t('Possible Partners This Month')}
            data={unlikelyDonations}
            donations={false}
            total={totalUnlikely}
            currency={totalCurrency}
          />
        </>
      ) : (
        <ExpectedMonthlyTotalReportEmpty />
      )}
    </Box>
  );
};
