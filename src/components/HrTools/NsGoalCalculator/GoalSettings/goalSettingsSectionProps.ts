export interface GoalSettingsSectionProps {
  hasSpouse: boolean;
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
