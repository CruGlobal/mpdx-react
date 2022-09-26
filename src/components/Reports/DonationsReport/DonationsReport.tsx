import React, { useState } from 'react';
import { Container, Box } from '@material-ui/core';
import { DateTime } from 'luxon';
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
