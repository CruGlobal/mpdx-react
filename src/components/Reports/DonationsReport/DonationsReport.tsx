import React from 'react';
import { Container, Box } from '@mui/material';
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
  return (
    <Box>
      <Header
        isNavListOpen={isNavListOpen}
        onNavListToggle={onNavListToggle}
        title={title}
      />
      <Container>
        <MonthlyActivitySection accountListId={accountListId} />
        <DonationsReportTable accountListId={accountListId} />
      </Container>
    </Box>
  );
};
