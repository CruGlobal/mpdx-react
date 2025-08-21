import React from 'react';
import { Divider, Link, Typography, styled } from '@mui/material';
import { Stack } from '@mui/system';
import { useTranslation } from 'react-i18next';
import { HouseholdExpensesHeader } from '../../HouseholdExpenses/HouseholdExpensesHeader';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { GoalCalculatorSection } from '../../Shared/GoalCalculatorSection';
import { getFamilySections } from '../../Shared/familySections';
import { ContinueButton } from '../../SharedComponents/ContinueButton';
import { GoalCalculatorGrid } from '../../SharedComponents/GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../../SharedComponents/SectionList';
import { PrimaryCategoryRightPanel } from '../PrimaryCategoryRightPanel/PrimaryCategoryRightPanel';

const CategoryContainer = styled('div')(({ theme }) => ({
  paddingInline: theme.spacing(4),
}));

const InstructionsWrapper = styled('div')(({ theme }) => ({
  '.MuiTypography-root': {
    marginBottom: theme.spacing(1),
  },
}));

export const HouseholdExpensesStep: React.FC = () => {
  const { handleContinue, goalCalculationResult } = useGoalCalculator();
  const { t } = useTranslation();
  const { data } = goalCalculationResult;
  const family = data?.goalCalculation.householdFamily;

  return (
    <GoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={family ? getFamilySections(family) : []} />
      }
      mainContent={
        <Stack flex={1} spacing={4} divider={<Divider />}>
          <CategoryContainer>
            <InstructionsWrapper>
              <Typography variant="h6">
                {t('Enter your monthly budget')}
              </Typography>
              <Typography variant="body2">
                {t(
                  'You may choose to skip entering your budget below if you know the net cash you need each month. If you know the net cash you need each month, click "Direct Input" and enter it there. Otherwise, enter your household expenses directly below.',
                )}
              </Typography>
              <Typography variant="body2">
                {t('For additional guidance, check out')}{' '}
                <Link href="https://www.ramseysolutions.com/budgeting/useful-forms">
                  {t('these resources from Ramsey Solutions')}
                </Link>
                .
              </Typography>
            </InstructionsWrapper>
            <HouseholdExpensesHeader categoriesTotal={7000} />
          </CategoryContainer>
          {family?.primaryBudgetCategories.map((category) => (
            <GoalCalculatorSection
              key={category.id}
              title={category.label}
              rightPanelContent={
                <PrimaryCategoryRightPanel category={category.category} />
              }
            >
              <GoalCalculatorGrid categoryName={category.label} />
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
