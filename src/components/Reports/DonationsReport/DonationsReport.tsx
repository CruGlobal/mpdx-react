import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { useGetDonationGraphQuery } from './GetDonationGraph.generated';
import DonationHistories from 'src/components/Dashboard/DonationHistories';
import {
  MultiPageHeader,
  HeaderTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
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
  const [time, setTime] = useState(DateTime.now().startOf('month'));
  const { query, replace } = useRouter();

  const { data } = useGetDonationGraphQuery({
    variables: {
      accountListId,
      designationAccountIds: designationAccounts?.length
        ? designationAccounts
        : null,
    },
  });

  useEffect(() => {
    if (typeof query.month === 'string') {
      setTime(DateTime.fromISO(query.month));
    }
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
