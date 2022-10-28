import React, { useEffect, useState } from 'react';
import { Container, Box } from '@mui/material';
import { DateTime } from 'luxon';
import { useRouter } from 'next/router';
import { ISODateString } from 'next-auth';
import { AccountsListHeader as Header } from '../AccountsListLayout/Header/Header';
import { MonthlyActivitySection } from './MonthlyActivity/MonthlyActivitySection';
import { DonationsReportTable } from './Table/DonationsReportTable';

interface Props {
  accountListId: string;
  isNavListOpen: boolean;
  onNavListToggle: () => void;
  title: string;
}

export const DonationsReport: React.FC<Props> = ({
  accountListId,
  isNavListOpen,
  onNavListToggle,
  title,
}) => {
  const [time, setTime] = useState(DateTime.now().startOf('month'));
  const { query, replace } = useRouter();
  useEffect(() => {
    if (query.month) {
      setTime(DateTime.fromISO(query.month as ISODateString));
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
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
      />
      <Container>
        <MonthlyActivitySection
          accountListId={accountListId}
          setTime={setTime}
        />
        <DonationsReportTable
          accountListId={accountListId}
          time={time}
          setTime={setTime}
        />
      </Container>
    </Box>
  );
};
