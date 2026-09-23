import { Theme } from '@mui/material';
import { TFunction } from 'i18next';
import {
  MpdAssignmentCategoryGroupEnum,
  MpdHealthStatusEnum,
  QuarterlyPayrollHistory,
} from 'src/graphql/types.generated';
import { ManagedStaffQuery } from './ManagedStaff.generated';

export type ManagedStaffMember =
  ManagedStaffQuery['managedStaff']['nodes'][number];

/** Rendered in place of a value `managedStaff` returned as null or empty. */
export const pendingField = '—';

/**
 * The MPDX-10069 warning for a staff member whose Monthly Gross Salary is
 * below their New Staff Monthly Salary, or null when it is not (or a benchmark
 * is missing). Shared by the staff row and the drawer so both say the same.
 */
export const grossSalaryWarning = (
  t: TFunction,
  formatCurrency: (amount: number) => string,
  member: Pick<ManagedStaffMember, 'newStaffMonthlySalary' | 'quarterlyHealth'>,
): string | null => {
  const gross = member.quarterlyHealth?.monthlyGrossSalary ?? null;
  const newStaff = member.newStaffMonthlySalary ?? null;
  if (gross === null || newStaff === null || gross >= newStaff) {
    return null;
  }
  // Even a fully paid salary cannot reach the New Staff benchmark
  return t(
    "Monthly Gross Salary ({{gross}}) is {{shortfall}} below the New Staff Monthly Salary ({{newStaff}}). Even at full salary, this staff member's payroll cannot reach the New Staff benchmark.",
    {
      gross: formatCurrency(gross),
      newStaff: formatCurrency(newStaff),
      shortfall: formatCurrency(newStaff - gross),
    },
  );
};

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

export interface YearMonth {
  year: number;
  /** 1-based calendar month */
  month: number;
}

/**
 * First and last calendar month of a Cru fiscal quarter. The fiscal year runs
 * September–August and is named for the calendar year in which it ends.
 */
export const getQuarterMonthRange = (
  fiscalYear: number,
  quarter: number,
): { start: YearMonth; end: YearMonth } => {
  // 0-based month index counted from January of the previous calendar year; Q1 starts in September
  const startMonthIndex = 8 + (quarter - 1) * 3;
  const toYearMonth = (index: number): YearMonth => ({
    year: fiscalYear - 1 + Math.floor(index / 12),
    month: (index % 12) + 1,
  });
  return {
    start: toYearMonth(startMonthIndex),
    end: toYearMonth(startMonthIndex + 2),
  };
};

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

interface QuarterAmountArgs {
  t: TFunction;
  status: MpdHealthStatusEnum;
  averagePayroll: number | null;
  /** `formatCurrency` from `useFormatters`, which helpers can't call itself. */
  formatCurrency: (value: number) => string;
}

/**
 * Only the last branch is a real amount — the other two are distinct kinds of
 * absence, and neither is a real $0.00.
 */
export const quarterAmountLabel = ({
  t,
  status,
  averagePayroll,
  formatCurrency,
}: QuarterAmountArgs): string => {
  if (averagePayroll === null) {
    return t('Partial');
  }
  if (status === MpdHealthStatusEnum.Gray && !averagePayroll) {
    return '-';
  }
  return formatCurrency(averagePayroll);
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

export const getLocalizedAssignmentCategoryGroup = (
  t: TFunction,
  group: MpdAssignmentCategoryGroupEnum | null | undefined,
): string => {
  switch (group) {
    case MpdAssignmentCategoryGroupEnum.FullTime:
      return t('Full time');
    case MpdAssignmentCategoryGroupEnum.PartTime:
      return t('Part time');
    default:
      return pendingField;
  }
};
