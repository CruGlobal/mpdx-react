import React from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Button, Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  SimplePrintOnly,
  SimpleScreenOnly,
} from 'src/components/Reports/styledComponents';
import { PrimaryBudgetCategoryEnum } from 'src/graphql/types.generated';
import { BudgetFamilyFragment } from '../../Shared/GoalCalculation.generated';
import { useGoalCalculator } from '../../Shared/GoalCalculatorContext';
import { GoalCalculatorLayout } from '../../Shared/GoalCalculatorLayout';
import { getFamilySections } from '../../Shared/familySections';
import { GoalCalculatorGrid } from '../GoalCalculatorGrid/GoalCalculatorGrid';
import { SectionList } from '../SectionList';
import { SectionPage } from '../SectionPage';
import { BudgetPrintTable } from './BudgetPrintTable';

interface ExpensesStepProps {
  instructions: React.ReactNode;
  family: BudgetFamilyFragment | null | undefined;
}

export const ExpensesStep: React.FC<ExpensesStepProps> = ({
  instructions,
  family,
}) => {
  const { t } = useTranslation();
  const {
    constants: { goalMiscConstants },
    currentStep,
  } = useGoalCalculator();
  const maxPhoneReimbursement =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.PHONE?.fee ?? null;
  const maxInternetReimbursement =
    goalMiscConstants.REIMBURSEMENTS_WITH_MAXIMUM?.INTERNET?.fee ?? null;

  return (
    <GoalCalculatorLayout
      sectionListPanel={
        <SectionList sections={family ? getFamilySections(family) : []} />
      }
      mainContent={
        <>
          <SimpleScreenOnly>
            <SectionPage>
              <Box>
                {/* Floated so the instructions keep the full width below it */}
                <Button
                  variant="outlined"
                  endIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  disabled={!family}
                  sx={{ float: 'right', ml: 2 }}
                >
                  {t('Print')}
                </Button>
                {/* Keeps SectionPage's spacing between instruction blocks */}
                <Stack spacing={4}>{instructions}</Stack>
              </Box>
              {family?.primaryBudgetCategories.map((category) => {
                const maxTotal =
                  category.category ===
                  PrimaryBudgetCategoryEnum.CellPhoneWorkLine
                    ? maxPhoneReimbursement
                    : category.category ===
                        PrimaryBudgetCategoryEnum.InternetServiceProviderFee
                      ? maxInternetReimbursement
                      : null;
                return (
                  <GoalCalculatorGrid
                    key={category.id}
                    category={category}
                    maxTotal={maxTotal}
                  />
                );
              })}
            </SectionPage>
          </SimpleScreenOnly>
          {family && (
            <SimplePrintOnly>
              <BudgetPrintTable title={currentStep.title} family={family} />
            </SimplePrintOnly>
          )}
        </>
      }
    />
  );
};
