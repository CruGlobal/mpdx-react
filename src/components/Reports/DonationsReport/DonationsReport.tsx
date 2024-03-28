import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { DateTime } from 'luxon';
import DonationHistories from 'src/components/Dashboard/DonationHistories';
import {
  HeaderTypeEnum,
  MultiPageHeader,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import { useGetDonationGraphQuery } from './GetDonationGraph.generated';
import { DonationsReportTable } from './Table/DonationsReportTable';

interface DonationReportsProps {
  accountListId: string;
  designationAccounts?: string[];
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  onSelectContact: (contactId: string) => void;
  title: string;
}

export const DonationsReport: React.FC<DonationReportsProps> = ({
  accountListId,
  designationAccounts,
  isNavListOpen,
  onNavListToggle,
  onSelectContact,
  title,
}) => {
  const { query, replace } = useRouter();
  const [time, setTime] = useState(() => {
    if (typeof query.month === 'string') {
      const date = DateTime.fromISO(query.month);
      if (date.isValid) {
        return date.startOf('month');
      }
    }

    return DateTime.now().startOf('month');
  });

  const { data, loading } = useGetDonationGraphQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    },
  });

  // Remove the month from the URL
  useEffect(() => {
    replace(
      {
        pathname: `/accountLists/${accountListId}/reports/donations`,
      },
      undefined,
      { shallow: true },
    );
  }, []);

  return (
    <Box>
      <MultiPageHeader
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
        headerType={HeaderTypeEnum.Report}
      />
      <Container>
        <DonationHistories
          loading={loading}
          goal={data?.accountList.monthlyGoal ?? undefined}
          pledged={data?.accountList.totalPledges}
          reportsDonationHistories={data?.reportsDonationHistories}
          currencyCode={data?.accountList.currency}
          setTime={setTime}
        />
        <DonationsReportTable
          accountListId={accountListId}
          designationAccounts={designationAccounts}
          onSelectContact={onSelectContact}
          time={time}
          setTime={setTime}
        />
      </Container>
    </Box>
  );
};
