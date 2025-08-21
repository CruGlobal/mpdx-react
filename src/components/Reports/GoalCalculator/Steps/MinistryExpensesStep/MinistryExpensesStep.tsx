import React from 'react';
import { Divider, Link, styled } from '@mui/material';
import { Stack } from '@mui/system';
import { Trans, useTranslation } from 'react-i18next';
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

export const MinistryExpensesStep: React.FC = () => {
  const { handleContinue, goalCalculationResult } = useGoalCalculator();
  const { t } = useTranslation();
  const { data } = goalCalculationResult;
  const family = data?.goalCalculation.ministryFamily;

  return (
    <GoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={family ? getFamilySections(family) : []} />
      }
      mainContent={
        <Stack flex={1} spacing={4} divider={<Divider />}>
          <CategoryContainer>
            <Trans t={t}>
              Enter amounts for the following categories of reimbursable and
              ministry expenses. The{' '}
              <Link href="https://staffweb.cru.org/mpd-donations/my-donations/mpga.html">
                MPGA tool on StaffWeb
              </Link>{' '}
              can show you your averages in some of these categories. If you did
              not take full reimbursements for the entire year, or if your
              reimbursements were abnormally high (e.g. you had a surgery or
              bought a new computer), or low (e.g. no summer mission), you will
              want to adjust the averages from the MPGA to reflect an average
              year. Click the link above, go to the Income/Expenses tab, and
              look under the Ministry Expenses section.
            </Trans>
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
