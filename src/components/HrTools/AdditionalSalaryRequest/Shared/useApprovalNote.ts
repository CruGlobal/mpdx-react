import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useFormatters } from 'src/components/HrTools/Shared/useFormatters';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { ApprovalThreshold, useFormUserInfo } from './useFormUserInfo';

const approvalNote = (
  { amount, reason }: ApprovalThreshold,
  format: (amount: number) => string,
  t: TFunction,
): string | null => {
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
    default:
      return null;
  }
};

// The amount past which the request needs approval, shown under the card's amounts. Pass show false where it would
// not describe the request, as on a submitted one that already counts toward the cap.
export const useApprovalNote = (show = true): string | null => {
  const { t } = useTranslation();
  const { formatCurrency } = useFormatters();
  const { approvalThreshold } = useFormUserInfo();

  if (!show || !approvalThreshold) {
    return null;
  }
  return approvalNote(approvalThreshold, formatCurrency, t);
};
