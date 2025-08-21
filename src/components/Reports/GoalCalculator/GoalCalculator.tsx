import React from 'react';
import { Divider, Stack, styled } from '@mui/material';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from './Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from './Shared/GoalCalculatorSection';
import { ListPanel } from './Shared/ListPanel';
import { ContinueButton } from './SharedComponents/ContinueButton';
import { GoalCalculatorGrid } from './SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';

const CategoryContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
}));

export const GoalCalculator: React.FC = () => {
  const { currentStep, handleContinue } = useGoalCalculator();

  const {
    instructions: stepInstructions,
    categories,
    PageComponent,
  } = currentStep;

  return PageComponent ? (
    <PageComponent />
  ) : (
    <GoalCalculatorLayout
      sectionListPanel={<ListPanel step={currentStep.id} />}
      mainContent={
        <Stack flex={1} spacing={4} divider={<Divider />}>
          {stepInstructions && (
            <CategoryContainer>{stepInstructions}</CategoryContainer>
          )}
          {categories?.map((category) => (
            <GoalCalculatorSection
              key={category.id}
              title={category.title}
              subtitle={category.subtitle}
              rightPanelContent={category.rightPanelComponent}
            >
              {category.component || (
                <GoalCalculatorGrid categoryName={category.title} />
              )}
            </GoalCalculatorSection>
          ))}
          <CategoryContainer>
            <ContinueButton onClick={handleContinue} />
          </CategoryContainer>
        </Stack>
      }
    />
  );
};
