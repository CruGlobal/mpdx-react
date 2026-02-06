import { useTranslation } from 'react-i18next';
import { ProgressiveApprovalTierEnum } from 'src/graphql/types.generated';
import { useSalaryCalculator } from '../SalaryCalculatorContext/SalaryCalculatorContext';
import { useFormatters } from '../Shared/useFormatters';

interface DialogContent {
  title: string;
  content: string;
  subContent: string;
}

export const useSubmitDialogContent = (): DialogContent => {
  const { t } = useTranslation();
  const { calculation, hcmUser } = useSalaryCalculator();
  const { formatCurrency } = useFormatters();

  const progressiveApprovalTier = calculation?.progressiveApprovalTier;
  const approvalRequired =
    !!progressiveApprovalTier &&
    progressiveApprovalTier.tier !== ProgressiveApprovalTierEnum.DivisionHead;
  const hasBoardCapException =
    hcmUser?.exceptionSalaryCap.boardCapException ?? false;

  if (!(approvalRequired || hasBoardCapException)) {
    return {
      title: t('Are you ready to submit your Salary Calculation Form?'),
      content: t('You are submitting your Salary Calculation Form.'),
      subContent: t('Your request will be sent to HR Services.'),
    };
  }

  let subContent: string;
  if (hasBoardCapException) {
    subContent = t(
      "You have a Board approved Maximum Allowable Salary (CAP) and your salary request exceeds that amount. As a result we need to get their approval for this request. We'll forward your request to them and get back to you with their decision.",
    );
  } else {
    const combinedGross =
      (calculation?.calculations?.requestedGross ?? 0) +
      (calculation?.spouseCalculations?.requestedGross ?? 0);
    subContent = t(
      'We will review your request through our Progressive Approvals process. For the {{amount}} you are requesting, this will take {{timeframe}} as it needs to be signed off by {{approvers}}. This may affect your selected effective date.',
      {
        amount: formatCurrency(combinedGross),
        timeframe: progressiveApprovalTier?.approvalTimeframe,
        approvers: progressiveApprovalTier?.approver,
      },
    );
  }

  return {
    title: t(
      'Your request requires additional approval because your Gross Salary exceeds your Maximum Allowable Salary. Do you want to continue?',
    ),
    content: t(
      'Requests exceeding your Maximum Allowable Salary require additional review.',
    ),
    subContent,
  };
};
