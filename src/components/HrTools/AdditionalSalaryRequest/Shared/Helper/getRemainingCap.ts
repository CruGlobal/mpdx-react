interface RemainingCapValues {
  currentSalaryCap?: number | null;
  grossAnnualSalary?: number | null;
  ytdAsrAmount?: number | null;
}

export const getRemainingCap = ({
  currentSalaryCap,
  grossAnnualSalary,
  ytdAsrAmount,
}: RemainingCapValues): number =>
  Math.max(
    0,
    (currentSalaryCap ?? 0) - ((grossAnnualSalary ?? 0) + (ytdAsrAmount ?? 0)),
  );
