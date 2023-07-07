import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@mui/material';
import {
  MultiPageHeader,
  HeaderTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useGetExpectedMonthlyTotalsQuery } from '../../../../pages/accountLists/[accountListId]/reports/GetExpectedMonthlyTotals.generated';
import { EmptyDonationsTable } from '../../../../src/components/common/EmptyDonationsTable/EmptyDonationsTable';
import { ExpectedMonthlyTotalReportHeader } from './Header/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './Table/ExpectedMonthlyTotalReportTable';

interface Props {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const ExpectedMonthlyTotalReport: React.FC<Props> = ({
  accountListId,
  designationAccounts,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const { t } = useTranslation();

  const { data, loading } = useGetExpectedMonthlyTotalsQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    },
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
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
        rightExtra={
          <ExpectedMonthlyTotalReportHeader
            empty={isEmpty}
            totalDonations={totalDonations}
            totalLikely={totalLikely}
            totalUnlikely={totalUnlikely}
            total={totalAmount}
            currency={totalCurrency}
          />
        }
      />
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <CircularProgress />
        </Box>
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
        <EmptyDonationsTable title="You have no expected donations this month" />
      )}
    </Box>
  );
};
