import { TFunction } from 'react-i18next';

/**
 * Explains why the calculation year matters. Shared by the MPD and New Staff
 * goal calculators' calculation year pickers so the copy cannot diverge.
 */
export const getCalculationYearTooltip = (t: TFunction): string =>
  t(
    'Benefits charges, geographic multipliers, base salary, and other constants change from year to year, which slightly increases most goals. Choose which year to calculate this goal with.',
  );
