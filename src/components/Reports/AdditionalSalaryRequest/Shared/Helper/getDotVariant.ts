import { AsrStatusEnum } from 'src/graphql/types.generated';

// Helper to determine if dot should be filled or outlined
export const getDotVariant = (
  status: AsrStatusEnum,
  step: 'submitted' | 'processed' | 'complete',
): 'filled' | 'outlined' => {
  switch (step) {
    case 'submitted':
      return 'filled';

    case 'processed':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired ||
        status === AsrStatusEnum.Pending
      ) {
        return 'filled';
      }
    // fallthrough
    case 'complete':
      if (
        status === AsrStatusEnum.Approved ||
        status === AsrStatusEnum.ActionRequired
      ) {
        return 'filled';
      }
    // fallthrough
    default:
      return 'outlined';
  }
};
