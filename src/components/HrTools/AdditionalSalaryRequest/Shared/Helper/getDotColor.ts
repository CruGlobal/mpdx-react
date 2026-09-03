import { AsrStatusEnum } from 'src/graphql/types.generated';

// Helper to get timeline dot color based on current status and step
export const getDotColor = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
  isPending: boolean,
  isApproved: boolean,
): string => {
  switch (step) {
    case 'submitted':
      if (status !== AsrStatusEnum.InProgress) {
        return 'success.main';
      }
      return 'info.main';

    case 'processed':
      if (isApproved) {
        return 'success.main';
      }
      if (isPending) {
        return 'info.main';
      }
    // fallthrough
    case 'complete':
      if (status === AsrStatusEnum.ApprovedAndPaid) {
        return 'success.main';
      }
      // Approved but payroll has not paid it yet, so the step is not done
      if (
        status === AsrStatusEnum.ApprovedNotPaid ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'warning.main';
      }
    // fallthrough
    default:
      return 'transparent';
  }
};
