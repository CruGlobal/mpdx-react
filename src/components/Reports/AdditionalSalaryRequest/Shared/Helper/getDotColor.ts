import { AsrStatusEnum } from 'src/graphql/types.generated';

// Helper to get timeline dot color based on current status and step
export const getDotColor = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
  isPending: boolean,
): string => {
  switch (step) {
    case 'submitted':
      if (status !== AsrStatusEnum.InProgress) {
        return 'success.main';
      }
      return 'info.main';

    case 'processed':
      if (
        status === AsrStatusEnum.ApprovedNotPaid ||
        status === AsrStatusEnum.ApprovedAndPaid ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'success.main';
      }
      if (isPending) {
        return 'info.main';
      }
    // fallthrough
    case 'complete':
      if (
        status === AsrStatusEnum.ApprovedNotPaid ||
        status === AsrStatusEnum.ApprovedAndPaid
      ) {
        return 'success.main';
      }
      if (status === AsrStatusEnum.ActionRequired) {
        return 'warning.main';
      }
    // fallthrough
    default:
      return 'transparent';
  }
};
