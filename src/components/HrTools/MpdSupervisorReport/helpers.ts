import { Theme } from '@mui/material';
import { TFunction } from 'i18next';
import {
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
} from 'src/graphql/types.generated';

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
  health: MpdHealthStatusEnum,
): { bg: string; color: string } => {
  switch (health) {
    case MpdHealthStatusEnum.Green:
      return {
        bg: theme.palette.chipGreenLight.main,
        color: theme.palette.chipGreenDark.main,
      };
    case MpdHealthStatusEnum.Red:
      return {
        bg: theme.palette.chipRedLight.main,
        color: theme.palette.chipRedDark.main,
      };
    case MpdHealthStatusEnum.Yellow:
      return {
        bg: theme.palette.chipYellowLight.main,
        color: theme.palette.chipYellowDark.main,
      };
    case MpdHealthStatusEnum.Gray:
    default:
      return {
        bg: theme.palette.chipGrayLight.main,
        color: theme.palette.chipGrayDark.main,
      };
  }
};

export const getQuarterLabel = (fiscalYear: number, quarter: number): string =>
  `FQ${quarter} ${fiscalYear.toString().slice(-2)}`;

/**
 * Map a quarter's MPD-health status to its screen-reader/chip label.
 */
export const healthLabel = (
  t: TFunction,
  health: MpdHealthStatusEnum,
): string => {
  switch (health) {
    case MpdHealthStatusEnum.Green:
      return t('on track');
    case MpdHealthStatusEnum.Red:
      return t('at risk');
    case MpdHealthStatusEnum.Yellow:
      return t('needs attention');
    case MpdHealthStatusEnum.Gray:
    default:
      return t('no data');
  }
};

export interface QuarterChipData {
  fiscalYear: number;
  quarter: number;
  status: MpdHealthStatusEnum;
  averagePayroll: number | null;
}

/**
 * Build an array of quarter chip data from quarterly payroll history.
 */
export const buildQuarterChips = ({
  completedQuarters,
  startingQuarter,
}: QuarterlyPayrollHistory): QuarterChipData[] =>
  [
    ...completedQuarters.map(
      ({ fiscalYear, quarter, status, averagePayroll }) => ({
        fiscalYear,
        quarter,
        status,
        averagePayroll,
      }),
    ),
    ...(startingQuarter
      ? [
          {
            fiscalYear: startingQuarter.fiscalYear,
            quarter: startingQuarter.quarter,
            status: MpdHealthStatusEnum.Gray,
            averagePayroll: null,
          },
        ]
      : []),
  ].sort((a, b) => a.fiscalYear - b.fiscalYear || a.quarter - b.quarter);
