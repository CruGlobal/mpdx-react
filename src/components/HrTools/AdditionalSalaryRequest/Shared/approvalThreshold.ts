interface CapFigures {
  currentSalaryCap?: number | null;
  grossAnnualSalary: number;
  ytdAsrAmount: number;
}

export type ApprovalThreshold = {
  amount: number;
  reason: 'ownCap' | 'combinedCap' | 'spouseOverCap';
} | null;

// The non-backpay amount past which this request needs approval, by the same rule as the API's
// RequestForms::TierLookup: over the person's own cap, over the couple's combined cap, or a spouse
// already over their cap. Year-to-date ASRs leave this request out, so a submitted request shows the
// amount it was judged against.
export const approvalThreshold = (
  own: (CapFigures & { combinedCap?: number | null }) | null | undefined,
  spouse: CapFigures | null | undefined,
): ApprovalThreshold => {
  if (own?.currentSalaryCap === null || own?.currentSalaryCap === undefined) {
    return null;
  }

  const ownCounted = own.grossAnnualSalary + own.ytdAsrAmount;
  const ownRoom = Math.max(own.currentSalaryCap - ownCounted, 0);
  if (!spouse) {
    return { amount: ownRoom, reason: 'ownCap' };
  }

  const spouseCounted = spouse.grossAnnualSalary + spouse.ytdAsrAmount;
  if (
    typeof spouse.currentSalaryCap === 'number' &&
    spouseCounted > spouse.currentSalaryCap
  ) {
    return { amount: 0, reason: 'spouseOverCap' };
  }

  if (typeof own.combinedCap === 'number') {
    const combinedRoom = Math.max(
      own.combinedCap - ownCounted - spouseCounted,
      0,
    );
    if (combinedRoom < ownRoom) {
      return { amount: combinedRoom, reason: 'combinedCap' };
    }
  }

  return { amount: ownRoom, reason: 'ownCap' };
};
