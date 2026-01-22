import { AsrStatusEnum } from 'src/graphql/types.generated';

// Helper to get timeline dot color based on current status and step
export const getDotColor = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
): string => {
  switch (step) {
    case 'submitted':
      if (status !== AsrStatusEnum.InProgress) {
        return 'success.main';
      }
      return 'info.main';

    case 'processed':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'success.main';
      }
      if (status === AsrStatusEnum.Pending) {
        return 'info.main';
      }
    // fallthrough
    case 'complete':
      if (status === AsrStatusEnum.Approved) {
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
