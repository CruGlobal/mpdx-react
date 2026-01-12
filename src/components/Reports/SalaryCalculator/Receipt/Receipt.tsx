import NextLink from 'next/link';
import { useState } from 'react';
import { Visibility } from '@mui/icons-material';
import {
  Alert,
  Button,
  ButtonBase,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useFormatters } from '../Shared/useFormatters';
import { MhaCard } from '../Summary/MhaCard';
import { SalaryCalculationCard } from '../Summary/SalaryCalculationCard';
import { SalaryCapCard } from '../Summary/SalaryCapCard';
import { SalarySummaryCard } from '../Summary/SalarySummaryCard';
import { StaffInfoSummaryCard } from '../Summary/StaffInfoSummaryCard';

export const ReceiptStep: React.FC = () => {
  const accountListId = useAccountListId();
  const { t } = useTranslation();
  const { calculation, hcmUser, hcmSpouse } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

  const [showReceipt, setShowReceipt] = useState(false);

  const userRequested = calculation?.calculations.requestedGross ?? 0;
  const spouseRequested = calculation?.spouseCalculations?.effectiveCap ?? 0;

  const userOverCap =
    calculation && userRequested > calculation.calculations.effectiveCap;
  const spouseOverCap =
    calculation?.spouseCalculations &&
    spouseRequested > calculation.spouseCalculations.effectiveCap;
  const requiresApproval = userOverCap || spouseOverCap;

  const requestedAmount = formatCurrency(userRequested + spouseRequested);

  const approvers = [
    hcmUser?.exceptionSalaryCap.exceptionApprover,
    hcmSpouse?.exceptionSalaryCap.exceptionApprover,
  ].filter((approver) => !!approver);
  const approversFormatted =
    approvers.length === 2
      ? `${approvers[0]} ${t('and')} ${approvers[1]}`
      : approvers[0];

  return (
    <Stack gap={4}>
      <Typography variant="h4">
        {t('Thank you for Submitting your Salary Calculation Form!')}
      </Typography>

      <Alert severity="success">
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {t("You've successfully submitted your Salary Calculation Form!")}
        </Typography>
        <Typography variant="body2">
          {requiresApproval ? (
            // TODO: Determine the time frame
            <Trans t={t}>
              Because your request exceeds your maximum allowable salary it will
              require additional approvals. For the {{ requestedAmount }} you
              are requesting, this will take [time frame] as it needs to be
              signed off by {{ approvers: approversFormatted }}. This may affect
              your selected effective date. We will review your request through
              our Progressive Approvals process and notify you of any changes to
              the status of this request.
            </Trans>
          ) : (
            <Trans t={t}>
              It will be processed by HR Services within the next 2-3 business
              days. Please print a copy for your records.
            </Trans>
          )}
        </Typography>
      </Alert>

      {showReceipt ? (
        <>
          <SalarySummaryCard />
          <StaffInfoSummaryCard />
          <SalaryCapCard />
          <SalaryCalculationCard />
          <MhaCard />
        </>
      ) : (
        <Stack direction="row" gap={1}>
          <Visibility sx={{ color: 'cruGrayMedium' }} />
          <Link component={ButtonBase} onClick={() => setShowReceipt(true)}>
            {t(
              'View or print a copy of your submitted Salary Calculation Request',
            )}
          </Link>
        </Stack>
      )}

      <Button
        component={NextLink}
        variant="contained"
        color="primary"
        sx={{ alignSelf: 'flex-start' }}
        href={`/accountLists/${accountListId}/reports/salaryCalculator`}
      >
        {t('View in Dashboard')}
      </Button>
    </Stack>
  );
};
