import React from 'react';
import { Divider, Stack, styled } from '@mui/material';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { ContinueButton } from '../../SharedComponents/ContinueButton';

const CategoryContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
}));

interface SectionPageProps {
  sections: React.ReactNode[];
}

export const SectionPage: React.FC<SectionPageProps> = ({ sections }) => {
  const { handleContinue } = useGoalCalculator();

  return (
    <Stack flex={1} spacing={4} divider={<Divider />}>
      {sections.map((section, index) => (
        <CategoryContainer key={index}>{section}</CategoryContainer>
      ))}
      <CategoryContainer>
        <ContinueButton onClick={handleContinue} />
      </CategoryContainer>
    </Stack>
  );
};
