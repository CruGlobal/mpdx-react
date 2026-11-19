import { useTranslation } from 'react-i18next';
import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { overBalanceMessage } from './overBalanceMessage';

export interface ApprovalThreshold {
  amount: number;
  reason: ProgressiveApprovalTierReasonEnum;
}

export const useFormUserInfo = () => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { requestData, user } = useAdditionalSalaryRequest();
  const calculations = requestData?.latestAdditionalSalaryRequest?.calculations;
  const {
    staffAccountBalance,
    staffAccountDeficitLimit,
    unpaidHouseholdAsrAmount,
    unpaidHouseholdAsrs,
    availableStaffAccountBalance,
    remainingAllowableSalary,
    approvalThreshold: thresholdAmount,
    approvalThresholdReason,
  } = calculations || {};
  const { emailAddress: email, preferredName: name } = user?.staffInfo ?? {};
  // The Primary balance plus its deficit limit, minus the household's other unpaid ASRs, all from SAA's own check
  const availableAccountBalance = availableStaffAccountBalance ?? 0;
  const balanceBreakdown = calculations
    ? {
        balance: staffAccountBalance ?? 0,
        deficitLimit: staffAccountDeficitLimit ?? 0,
        unpaidTotal: unpaidHouseholdAsrAmount ?? 0,
        unpaidRequests: unpaidHouseholdAsrs ?? [],
      }
    : null;
  const remainingCap = remainingAllowableSalary ?? null;
  // The non-backpay amount past which this request needs approval, from the same caps the API checks at submit
  const approvalThreshold: ApprovalThreshold | null =
    typeof thresholdAmount === 'number' && approvalThresholdReason
      ? { amount: thresholdAmount, reason: approvalThresholdReason }
      : null;

  return {
    email,
    name,
    availableAccountBalance,
    balanceBreakdown,
    overBalanceMessage: overBalanceMessage(t, locale, availableAccountBalance),
    remainingCap,
    approvalThreshold,
  };
};
