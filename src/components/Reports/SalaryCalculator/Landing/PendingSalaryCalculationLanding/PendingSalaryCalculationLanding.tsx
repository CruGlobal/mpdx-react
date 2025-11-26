import React from 'react';
import { Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SalaryInformationCard } from '../SalaryInformationCard';
import { PendingRequestCard } from './PendingRequestCard';
import { StaffNameCard } from './StaffNameCard';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const PendingSalaryCalculationLanding: React.FC = () => {
  return (
    <StyledContainer maxWidth="lg">
      <StaffNameCard />
      <PendingRequestCard />
      <SalaryInformationCard />
    </StyledContainer>
  );
};
