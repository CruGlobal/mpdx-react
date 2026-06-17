import { TFunction } from 'react-i18next';
import { AssignmentStatusEnum } from 'src/graphql/types.generated';

/**
 * Maps an HCM assignment status to a localized, human-readable label
 */
export const getLocalizedAssignmentStatus = (
  t: TFunction,
  assignmentStatus: AssignmentStatusEnum | null | undefined,
): string => {
  switch (assignmentStatus) {
    case AssignmentStatusEnum.ActiveFmlaLeave:
      return t('Active - FMLA Leave');
    case AssignmentStatusEnum.ActiveNoPayroll:
      return t('Active - No Payroll');
    case AssignmentStatusEnum.ActivePaidLeave:
      return t('Active - Paid Leave');
    case AssignmentStatusEnum.ActivePayrollEligible:
      return t('Active - Payroll Eligible');
    case AssignmentStatusEnum.ActiveUnpaidLeave:
      return t('Active - Unpaid Leave');
    case AssignmentStatusEnum.DisabilityPayrollEligible:
      return t('Disability - Payroll Eligible');
    case AssignmentStatusEnum.InactiveNoPayroll:
      return t('Inactive - No Payroll');
    case AssignmentStatusEnum.InactivePayrollEligible:
      return t('Inactive - Payroll Eligible');
    case AssignmentStatusEnum.InactiveProcessWhenEarnings:
      return t('Inactive - Process when Earnings');
    case AssignmentStatusEnum.PendingNoPayroll:
      return t('Pending - No Payroll');
    case AssignmentStatusEnum.RaisingInitialSupportNoPayroll:
      return t('Raising Initial Support - No Payroll');
    case AssignmentStatusEnum.RaisingInitialSupportPayrollEligible:
      return t('Raising Initial Support - Payroll Eligible');
    default:
      return t('Unknown Assignment Status');
  }
};
