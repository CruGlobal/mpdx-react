import { NewStaffGoalCalculationFieldsFragment } from './NewStaffGoalCalculation.generated';

export interface GoalSettingsSectionProps {
  hasSpouse: boolean;
  /**
   * Whether the "Senior Staff Only" rows should be shown. They are hidden when
   * the staff is single/SOSA or the spouse is joining staff.
   */
  seniorStaff: boolean;
  /**
   * Computed worksheet amounts for the saved calculation, used for read-only
   * derived displays (e.g. the 403(b) contribution amount).
   */
  calculations: NewStaffGoalCalculationFieldsFragment['calculations'];
  /** Primary person's first name, e.g. "John". */
  primaryName: string;
  /** Spouse's first name, e.g. "Jane" (empty string when no spouse). */
  spouseName: string;
  /**
   * Visible per-person column headers: both people for a couple, just the
   * primary person otherwise, e.g. ["John (Joining)", "Jane (Senior)"].
   */
  visibleHeaders: string[];
  /** Combined household header, e.g. "John (Joining) & Jane (Senior)". */
  sharedHeader: string;
}
