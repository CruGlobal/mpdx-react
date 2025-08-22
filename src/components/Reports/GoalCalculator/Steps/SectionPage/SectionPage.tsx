import React from 'react';
import { Divider, Stack, styled } from '@mui/material';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { ContinueButton } from '../../SharedComponents/ContinueButton';

const StyledStack = styled(Stack)(({ theme }) => ({
  '> *:not(.MuiDivider-root)': {
    paddingInline: theme.spacing(4),
  },
}));

interface SectionPageProps {
  children?: React.ReactNode;
}

export const SectionPage: React.FC<SectionPageProps> = ({ children }) => {
  const { handleContinue } = useGoalCalculator();

  return (
    <StyledStack spacing={4} divider={<Divider />}>
      {children}
      <ContinueButton onClick={handleContinue} />
    </StyledStack>
  );
};
