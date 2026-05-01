export const safeProgressRatio = (
  numerator: number,
  denominator: number,
): number => (denominator > 0 ? Math.min(numerator / denominator, 1) : 0);
