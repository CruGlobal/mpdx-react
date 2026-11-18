import { ProgressiveApprovalTierReasonEnum } from 'src/graphql/types.generated';

interface CapFigures {
  currentSalaryCap?: number | null;
  grossAnnualSalary: number;
  ytdAsrAmount: number;
}

interface OwnCapFigures extends CapFigures {
  combinedCap?: number | null;
  remainingAllowableSalary?: number | null;
}

export interface ApprovalThreshold {
  amount: number;
  reason:
    | ProgressiveApprovalTierReasonEnum.OverUserCap
    | ProgressiveApprovalTierReasonEnum.OverCombinedCap
    | ProgressiveApprovalTierReasonEnum.OverSpouseCap;
}

// Rounded down so a request of exactly the amount shown never needs approval
const floorToCents = (amount: number) => Math.floor(amount * 100 + 1e-6) / 100;

// The non-backpay amount past which a new request needs approval, by the same rule as the API's
// RequestForms::TierLookup: over the person's own cap, over the couple's combined cap, or a spouse
// already over their cap. The own room is the API's remaining allowable salary, which counts every
// earlier request of this year, so it is computed from current figures.
export const approvalThreshold = (
  own: OwnCapFigures | null | undefined,
  spouse: CapFigures | null | undefined,
): ApprovalThreshold | null => {
  if (!own) {
    return null;
  }
  const { currentSalaryCap: cap, remainingAllowableSalary } = own;
  if (typeof cap !== 'number' || typeof remainingAllowableSalary !== 'number') {
    return null;
  }
  const ownRoom = Math.max(remainingAllowableSalary, 0);

  const ownCounted = Math.max(
    own.grossAnnualSalary + own.ytdAsrAmount,
    cap - ownRoom,
  );
  const spouseCounted = spouse
    ? spouse.grossAnnualSalary + spouse.ytdAsrAmount
    : 0;
  if (
    typeof spouse?.currentSalaryCap === 'number' &&
    spouseCounted > spouse.currentSalaryCap
  ) {
    return {
      amount: 0,
      reason: ProgressiveApprovalTierReasonEnum.OverSpouseCap,
    };
  }

  if (spouse && typeof own.combinedCap === 'number') {
    const combinedRoom = Math.max(
      own.combinedCap - ownCounted - spouseCounted,
      0,
    );
    // TierLookup checks the combined cap first, so it names that cap when both are hit at once
    if (combinedRoom <= ownRoom) {
      return {
        amount: floorToCents(combinedRoom),
        reason: ProgressiveApprovalTierReasonEnum.OverCombinedCap,
      };
    }
  }

  return {
    amount: floorToCents(ownRoom),
    reason: ProgressiveApprovalTierReasonEnum.OverUserCap,
  };
};
