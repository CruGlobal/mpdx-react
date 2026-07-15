import Link from 'next/link';
import React from 'react';
import { Box } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  ProgressiveApprovalTierEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { progressiveApprovalsLink } from '../../AdditionalSalaryRequest/Shared/pdfLinks';
import { useCaps } from '../SalaryCalculation/useCaps';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';

interface DialogContent {
  title: string;
  content: string;
  subContent: React.ReactNode;
}

export const useSubmitDialogContent = (): DialogContent => {
  const { t } = useTranslation();
  const { calculation } = useSalaryCalculator();
  const { combinedGross } = useCaps();
  const { formatCurrency } = useFormatters();

  const progressiveApprovalTier = calculation?.progressiveApprovalTier;
  const reason = calculation?.progressiveApprovalTierReason;
  const approvalRequired =
    !!progressiveApprovalTier &&
    progressiveApprovalTier.tier !== ProgressiveApprovalTierEnum.DivisionHead;

  if (!approvalRequired) {
    return {
      title: t('Are you ready to submit your Salary Calculation Form?'),
      content: t('You are submitting your Salary Calculation Form.'),
      subContent: t('Your request will be sent to HR Services.'),
    };
  }

  let title = t(
    'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to continue?',
  );
  let subContent: React.ReactNode;
  if (reason === ProgressiveApprovalTierReasonEnum.BoardCapException) {
    subContent = t(
      "You have a Board approved Maximum Allowable Salary (CAP) and your salary request exceeds that amount. As a result we need to get their approval for this request. We'll forward your request to them and get back to you with their decision.",
    );
  } else if (reason === ProgressiveApprovalTierReasonEnum.OverlappingRequests) {
    title = t(
      'Your request requires additional approval. Do you want to continue?',
    );
    subContent = t(
      'You or your spouse has a pending Additional Salary Request, so this request needs additional approval. This will take {{timeframe}} as it needs to be signed off by {{approvers}}. This may affect your selected effective date.',
      {
        timeframe: progressiveApprovalTier?.approvalTimeframe,
        approvers: progressiveApprovalTier?.approver,
      },
    );
  } else {
    subContent = (
      <Box>
        <Trans t={t}>
          We will review your request through our{' '}
          <Link
            href={progressiveApprovalsLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline', color: theme.palette.primary.main }}
          >
            Progressive Approvals
          </Link>{' '}
          process. For the {{ amount: formatCurrency(combinedGross) }} you are
          requesting, this will take{' '}
          {{ timeframe: progressiveApprovalTier?.approvalTimeframe }} as it
          needs to be signed off by{' '}
          {{ approvers: progressiveApprovalTier?.approver }}. This may affect
          your selected effective date.
        </Trans>
      </Box>
    );
  }

  return {
    title,
    content: t(
      'Requests exceeding your Maximum Allowable Salary require additional review.',
    ),
    subContent,
  };
};
