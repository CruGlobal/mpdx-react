import { Theme } from '@mui/material';
import { TFunction } from 'i18next';
import {
  MpdAssignmentCategoryGroupEnum,
  MpdHealthStatusEnum,
  PeopleGroupSupportTypeEnum,
  QuarterlyPayrollHistory,
  SecaStatusEnum,
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
    // Newest quarter first, so the most recent health is what the eye lands on
  ].sort((a, b) => b.fiscalYear - a.fiscalYear || b.quarter - a.quarter);

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

/**
 * A list row. When both spouses are in the results the second one is folded
 * into the first as `partner`, so the pair takes one row.
 */
export type StaffRow = ManagedStaffMember & { partner?: ManagedStaffMember };

/**
 * Fold each spouse pair present in the list into one row, keeping the earlier
 * position (spouses share a staff account, so their health sorts identically).
 * Each spouse keeps their own team list; `getRowTeamNames` unions them for
 * display. A spouse who is not in the list leaves the row untouched.
 */
export const mergeSpouseRows = (nodes: ManagedStaffMember[]): StaffRow[] => {
  const byPersonNumber = new Map(
    nodes.map((node) => [node.personNumber, node]),
  );
  const absorbed = new Set<string>();
  const rows: StaffRow[] = [];
  for (const node of nodes) {
    if (absorbed.has(node.personNumber)) {
      continue;
    }
    const partner = node.spousePersonNumber
      ? byPersonNumber.get(node.spousePersonNumber)
      : undefined;
    // Only a mutual pair merges, so a stale spouse link cannot swallow a row
    if (partner && partner.spousePersonNumber === node.personNumber) {
      absorbed.add(partner.personNumber);
      rows.push({ ...node, partner });
    } else {
      rows.push(node);
    }
  }
  return rows;
};

/** The row's team names: the member's teams plus a merged partner's, deduplicated. */
export const getRowTeamNames = ({ teams, partner }: StaffRow): string[] => [
  ...new Set([
    ...teams.employee.map(({ name }) => name),
    ...(partner?.teams.employee.map(({ name }) => name) ?? []),
  ]),
];

/** "Anton & Artjola Capo", or both full names when the last names differ. */
export const getRowName = ({
  firstName,
  lastName,
  partner,
}: StaffRow): string => {
  if (!partner) {
    return `${firstName} ${lastName}`;
  }
  return partner.lastName === lastName
    ? `${firstName} & ${partner.firstName} ${lastName}`
    : `${firstName} ${lastName} & ${partner.firstName} ${partner.lastName}`;
};

/** Both first initials for a pair; the usual first + last initials otherwise. */
export const getRowInitials = ({
  firstName,
  lastName,
  partner,
}: StaffRow): string =>
  partner
    ? getInitials(firstName, partner.firstName)
    : getInitials(firstName, lastName);

/** People in the rows, counting a merged pair as two. */
export const countPeople = (rows: StaffRow[]): number =>
  rows.reduce((total, row) => total + (row.partner ? 2 : 1), 0);

/** Status of the newest completed quarter; Gray when none has completed. */
export const latestQuarterStatus = ({
  quarterlyHealth,
}: Pick<ManagedStaffMember, 'quarterlyHealth'>): MpdHealthStatusEnum => {
  const [latest] = [...(quarterlyHealth?.completedQuarters ?? [])].sort(
    (a, b) => b.fiscalYear - a.fiscalYear || b.quarter - a.quarter,
  );
  return latest?.status ?? MpdHealthStatusEnum.Gray;
};

export interface TeamSummaryRow {
  name: string;
  staffCount: number;
  counts: Record<MpdHealthStatusEnum, number>;
}

const emptyCounts = (): Record<MpdHealthStatusEnum, number> => ({
  [MpdHealthStatusEnum.Red]: 0,
  [MpdHealthStatusEnum.Yellow]: 0,
  [MpdHealthStatusEnum.Green]: 0,
  [MpdHealthStatusEnum.Gray]: 0,
});

/**
 * How each team in the rows is doing: people per latest-quarter status. A
 * person on several teams counts toward each; a merged partner counts on their
 * own teams. Worst teams first: most at risk, then most needing attention.
 */
export const summarizeTeams = (rows: StaffRow[]): TeamSummaryRow[] => {
  const teams = new Map<string, TeamSummaryRow>();
  const add = (member: ManagedStaffMember, teamNames: string[]) => {
    const status = latestQuarterStatus(member);
    for (const name of new Set(teamNames)) {
      const team = teams.get(name) ?? {
        name,
        staffCount: 0,
        counts: emptyCounts(),
      };
      team.staffCount += 1;
      team.counts[status] += 1;
      teams.set(name, team);
    }
  };
  for (const row of rows) {
    const { partner, ...member } = row;
    add(
      member,
      member.teams.employee.map(({ name }) => name),
    );
    if (partner) {
      add(
        partner,
        partner.teams.employee.map(({ name }) => name),
      );
    }
  }
  return [...teams.values()].sort(
    (a, b) =>
      b.counts[MpdHealthStatusEnum.Red] - a.counts[MpdHealthStatusEnum.Red] ||
      b.counts[MpdHealthStatusEnum.Yellow] -
        a.counts[MpdHealthStatusEnum.Yellow] ||
      a.name.localeCompare(b.name),
  );
};

export const getLocalizedSupportType = (
  t: TFunction,
  value: PeopleGroupSupportTypeEnum | null | undefined,
): string => {
  switch (value) {
    case PeopleGroupSupportTypeEnum.SupportedRmo:
      return t('Supported RMO');
    case PeopleGroupSupportTypeEnum.SupportedNonRmo:
      return t('Supported non-RMO');
    case PeopleGroupSupportTypeEnum.Designation:
      return t('Designation');
    case PeopleGroupSupportTypeEnum.None:
      return t('Not supported');
    default:
      return pendingField;
  }
};

export const getLocalizedSecaStatus = (
  t: TFunction,
  value: SecaStatusEnum | null | undefined,
): string => {
  switch (value) {
    case SecaStatusEnum.Seca:
      return t('Pays SECA');
    case SecaStatusEnum.Fica:
      return t('Pays FICA');
    case SecaStatusEnum.Optout:
      return t('Exempt from SECA');
    default:
      return pendingField;
  }
};
