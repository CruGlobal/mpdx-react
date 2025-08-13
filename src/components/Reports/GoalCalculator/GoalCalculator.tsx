import React from 'react';
import { Divider, Stack, styled } from '@mui/material';
import { useGoalCalculator } from './Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from './Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from './Shared/GoalCalculatorSection';
import { ContinueButton } from './SharedComponents/ContinueButton';
import { SectionList } from './SharedComponents/SectionList';

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
      sectionListPanel={
        <SectionList
          sections={
            categories?.map((category) => ({
              title: category.title,
              // TODO: Determine whether each category is complete
              complete: false,
            })) ?? []
          }
        />
      }
      mainContent={
        <Stack flex={1} spacing={4} divider={<Divider />}>
          {stepInstructions && (
            <CategoryContainer>{stepInstructions}</CategoryContainer>
          )}
          {categories?.map((category) => (
            <GoalCalculatorSection
              key={category.id}
              title={category.title}
              rightPanelContent={category.rightPanelComponent}
            >
              {category.component}
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
