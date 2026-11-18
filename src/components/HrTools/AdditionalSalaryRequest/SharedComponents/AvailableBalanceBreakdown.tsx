import React from 'react';
import { List, ListItem, Stack, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import {
  AsrStatusEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import { useAdditionalSalaryRequest } from '../Shared/AdditionalSalaryRequestContext';
import { ApprovalThreshold } from '../Shared/approvalThreshold';
import { useFormUserInfo } from '../Shared/useFormUserInfo';

const requestLabel = (spouse: boolean, t: TFunction): string =>
  spouse ? t("Your spouse's request") : t('Your request');

const approvalNote = (
  { amount, reason }: ApprovalThreshold,
  format: (amount: number) => string,
  t: TFunction,
): string => {
  switch (reason) {
    case ProgressiveApprovalTierReasonEnum.OverSpouseCap:
      return t(
        'Any amount needs approval because your spouse is over their cap.',
      );
    case ProgressiveApprovalTierReasonEnum.OverCombinedCap:
      return t(
        "Requests over {{amount}} (what's left under your combined cap with your spouse) need approval. Current year's salary not received doesn't count toward this amount.",
        { amount: format(amount) },
      );
    case ProgressiveApprovalTierReasonEnum.OverUserCap:
      return t(
        "Requests over {{amount}} (your remaining allowable salary) need approval. Current year's salary not received doesn't count toward this amount.",
        { amount: format(amount) },
      );
  }
};

const statusLabel = (status: AsrStatusEnum, t: TFunction): string => {
  switch (status) {
    case AsrStatusEnum.ApprovedNotPaid:
      return t('approved, waiting to be paid');
    case AsrStatusEnum.ActionRequired:
      return t('waiting for changes');
    default:
      return t('waiting for approval');
  }
};

interface AvailableBalanceBreakdownProps {
  // A submitted request already counts toward the cap, so the note would not describe it
  showApprovalNote?: boolean;
}

// Explains the "Available for This Request" amount with the same numbers SAA checks the request against, and the
// amount past which the request needs approval
export const AvailableBalanceBreakdown: React.FC<
  AvailableBalanceBreakdownProps
> = ({ showApprovalNote = true }) => {
  const { t } = useTranslation();
  const { formatCurrency: format } = useFormatters();
  const { hcmLoading } = useAdditionalSalaryRequest();
  const { balanceBreakdown, approvalThreshold } = useFormUserInfo();

  if (hcmLoading || !balanceBreakdown) {
    return null;
  }

  const { balance, deficitLimit, unpaidTotal, unpaidRequests } =
    balanceBreakdown;
  const parts = [
    t('Primary balance of {{amount}}', { amount: format(balance) }),
  ];
  if (deficitLimit) {
    parts.push(
      t('plus deficit limit of {{amount}}', { amount: format(deficitLimit) }),
    );
  }
  if (unpaidTotal) {
    parts.push(
      t('minus {{amount}} in other unpaid requests', {
        amount: format(unpaidTotal),
      }),
    );
  }

  return (
    <Stack>
      <Typography variant="body2" color="text.secondary">
        {parts.join(', ')}
      </Typography>
      {unpaidRequests.length > 0 && (
        <List dense disablePadding>
          {unpaidRequests.map((request, index) => (
            <ListItem key={index} disableGutters disablePadding>
              <Typography variant="body2" color="text.secondary">
                {t('{{request}}, {{status}}: {{amount}}', {
                  request: requestLabel(request.spouse, t),
                  status: statusLabel(request.status, t),
                  amount: format(request.amount),
                })}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}
      {showApprovalNote && approvalThreshold && (
        <Typography variant="body2" color="text.secondary">
          {approvalNote(approvalThreshold, format, t)}
        </Typography>
      )}
    </Stack>
  );
};
