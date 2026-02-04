import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Link, Stack, Typography } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { SimpleScreenOnly } from 'src/components/Reports/styledComponents';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ApprovalProcessCard } from '../SalaryCalculation/ApprovalProcessCard/ApprovalProcessCard';
import { RequestSummaryCard } from '../SalaryCalculation/RequestSummaryCard/RequestSummaryCard';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { ContactInfoForm } from './ContactInfoForm';
import { MhaCard } from './MhaCard';
import { SalaryCalculationCard } from './SalaryCalculationCard';
import { SalaryCapCard } from './SalaryCapCard';
import { SalarySummaryCard } from './SalarySummaryCard';
import { StaffInfoSummaryCard } from './StaffInfoSummaryCard';

export const SummaryStep: React.FC = () => {
  const router = useRouter();
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const [showCompleteCalculations, setShowCompleteCalculations] =
    useState(false);
  const { editing, loading } = useSalaryCalculator();

  const { print } = router.query;
  useEffect(() => {
    if (print === 'true' && !loading) {
      window.print();
      const nextQuery = { ...router.query };
      delete nextQuery.print;

      router.replace(
        { pathname: router.pathname, query: nextQuery },
        undefined,
        { shallow: true },
      );
    }
  }, [print, loading]);

  return (
    <Stack gap={4} padding={4} sx={{ '@media print': { padding: 1, gap: 2 } }}>
      <Typography variant="h4">{t('Summary')}</Typography>
      <SimpleScreenOnly>
        {editing && (
          <Typography variant="body1">
            <Trans t={t}>
              Please review the detailed summary of the salary you are
              requesting below. If it is correct, click the &quot;Submit&quot;
              button on the bottom of this page. You may make changes to some of
              the fields by selecting the section you would like to return to in
              the menu to the left.
            </Trans>
          </Typography>
        )}

        <Typography variant="body1" sx={{ ul: { pl: 2 } }}>
          <Trans t={t}>
            As you review the information here, please take note:
            <ul>
              <li>
                Staff members are paid individually according to the amount that
                is requested within policy.
              </li>
              <li>
                If you are married, as you set your salary levels, the amount
                each spouse receives should reflect the amount of time each
                works in ministry.
              </li>
              <li>
                To submit online your Gross Salary (line 14), which includes
                403(b) and (if applicable) Social Security, may not exceed your
                Maximum Allowable Salary (CAP - line 9).
              </li>
              <li>
                For approved expenses, additional salary may be requested by
                using the{' '}
                <Link
                  component={NextLink}
                  href={`/accountLists/${accountListId}/reports/additionalSalaryRequest`}
                >
                  Additional Salary Request Form
                </Link>
                .
              </li>
            </ul>
          </Trans>
        </Typography>
      </SimpleScreenOnly>
      <SalarySummaryCard />
      <StaffInfoSummaryCard />
      <RequestSummaryCard />
      <ApprovalProcessCard />

      <SimpleScreenOnly>
        <Button
          endIcon={showCompleteCalculations ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setShowCompleteCalculations(!showCompleteCalculations)}
          sx={{ alignSelf: 'flex-start' }}
        >
          {t('View Complete Calculations')}
        </Button>

        {showCompleteCalculations && (
          <>
            <SalaryCapCard />
            <SalaryCalculationCard />
            <MhaCard />
          </>
        )}
      </SimpleScreenOnly>

      {editing && <ContactInfoForm />}
    </Stack>
  );
};
