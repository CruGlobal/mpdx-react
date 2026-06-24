import { Theme } from '@mui/material';
import { QuarterHealthEnum } from './mockData';

/**
 * Build avatar initials from a person's first and last name.
 * Returns the uppercased first letter of each (e.g. "Jane Doe" -> "JD").
 */
export const getInitials = (firstName?: string, lastName?: string): string =>
  ((firstName?.[0] ?? '') + (lastName?.[0] ?? '')).toUpperCase();

/**
 * Map a quarter's MPD-health status to the chip background/foreground colors.
 * Takes `theme` so callers can pass either the imported theme or the theme
 * provided by an `sx` callback.
 */
export const healthColor = (
  theme: Theme,
  health: QuarterHealthEnum,
): { bg: string; color: string } => {
  switch (health) {
    case QuarterHealthEnum.Green:
      return {
        bg: theme.palette.chipGreenLight.main,
        color: theme.palette.chipGreenDark.main,
      };
    case QuarterHealthEnum.Red:
      return {
        bg: theme.palette.chipRedLight.main,
        color: theme.palette.chipRedDark.main,
      };
    case QuarterHealthEnum.Yellow:
    default:
      return {
        bg: theme.palette.chipYellowLight.main,
        color: theme.palette.chipYellowDark.main,
      };
  }
};
