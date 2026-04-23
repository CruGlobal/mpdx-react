import { AsrStatusEnum } from 'src/graphql/types.generated';

// Helper to determine if dot should be filled or outlined
export const getDotVariant = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
  isPending: boolean,
  isApproved: boolean,
): 'filled' | 'outlined' => {
  switch (step) {
    case 'submitted':
      return 'filled';

    case 'processed':
      if (isApproved || status === AsrStatusEnum.ActionRequired || isPending) {
        return 'filled';
      }
    // fallthrough
    case 'complete':
      if (isApproved || status === AsrStatusEnum.ActionRequired) {
        return 'filled';
      }
    // fallthrough
    default:
      return 'outlined';
  }
};
