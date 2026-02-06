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
import { useCaps } from '../SalaryCalculation/useCaps';
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
  const { formatCurrency } = useFormatters();
  const { hcmUser, calculation } = useSalaryCalculator();
  const progressiveApprovalTier = calculation?.progressiveApprovalTier;
  const boardCapException = hcmUser?.exceptionSalaryCap.boardCapException;
  const { combinedGross } = useCaps();

  const [showReceipt, setShowReceipt] = useState(false);

  const requestedAmount = formatCurrency(combinedGross);

  return (
    <Stack gap={4}>
      <Typography variant="h4">
        {t('Thank you for Submitting your Salary Calculation Form!')}
      </Typography>

      <Alert severity="success">
        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
          {t("You've successfully submitted your Salary Calculation Form!")}
        </Typography>
        <Typography data-testid="Receipt-message" variant="body2">
          {!progressiveApprovalTier ? (
            <Trans t={t}>
              It will be processed by HR Services within the next 2-3 business
              days. Please print a copy for your records.
            </Trans>
          ) : boardCapException ? (
            <Trans t={t}>
              You have a Board approved Maximum Allowable Salary (CAP) and your
              salary request exceeds that amount. As a result we need to get
              their approval for this request. We&apos;ll forward your request
              to them and get back to you with their decision.
            </Trans>
          ) : (
            <Trans t={t}>
              Because your request exceeds your maximum allowable salary it will
              require additional approvals. For the {{ requestedAmount }} you
              are requesting, this will take{' '}
              {{ timeframe: progressiveApprovalTier.approvalTimeframe }} as it
              needs to be signed off by the{' '}
              {{ approver: progressiveApprovalTier.approver }}. This may affect
              your selected effective date. We will review your request through
              our Progressive Approvals process and notify you of any changes to
              the status of this request.
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
          <Visibility
            sx={(theme) => ({ color: theme.palette.mpdxGrayDark.main })}
          />
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
