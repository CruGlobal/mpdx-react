import { TFunction } from 'i18next';
import {
  CompletedQuarterPayroll,
  MpdAssignmentCategoryGroupEnum,
  MpdHealthStatusEnum,
  PeopleGroupSupportTypeEnum,
  SecaStatusEnum,
  StartingQuarterPayroll,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  buildQuarterChips,
  countPeople,
  getInitials,
  getLocalizedAssignmentCategoryGroup,
  getLocalizedSecaStatus,
  getLocalizedSupportType,
  getQuarterLabel,
  getQuarterMonthRange,
  getRowInitials,
  getRowName,
  getRowTeamNames,
  healthColor,
  healthLabel,
  latestQuarterStatus,
  mergeSpouseRows,
  pendingField,
  quarterAmountLabel,
  summarizeTeams,
} from './helpers';
import { managedStaffMember } from './mpdSupervisorReportMocks';

const t = ((key: string) => key) as unknown as TFunction;

describe('getInitials', () => {
  it('returns the uppercased first letter of each name', () => {
    expect(getInitials('Jane', 'Doe')).toBe('JD');
  });

  it('lowercases input names to uppercase initials', () => {
    expect(getInitials('jane', 'doe')).toBe('JD');
  });

  it('handles a missing last name', () => {
    expect(getInitials('Jane')).toBe('J');
  });

  it('handles a missing first name', () => {
    expect(getInitials(undefined, 'Doe')).toBe('D');
  });

  it('returns an empty string when both names are missing', () => {
    expect(getInitials()).toBe('');
  });

  it('returns an empty string for empty-string names', () => {
    expect(getInitials('', '')).toBe('');
  });
});

describe('healthColor', () => {
  it('returns green palette colors for Green', () => {
    expect(healthColor(theme, MpdHealthStatusEnum.Green)).toEqual({
      bg: theme.palette.chipGreenLight.main,
      color: theme.palette.chipGreenDark.main,
    });
  });

  it('returns red palette colors for Red', () => {
    expect(healthColor(theme, MpdHealthStatusEnum.Red)).toEqual({
      bg: theme.palette.chipRedLight.main,
      color: theme.palette.chipRedDark.main,
    });
  });

  it('returns yellow palette colors for Yellow', () => {
    expect(healthColor(theme, MpdHealthStatusEnum.Yellow)).toEqual({
      bg: theme.palette.chipYellowLight.main,
      color: theme.palette.chipYellowDark.main,
    });
  });

  it('returns gray palette colors for Gray', () => {
    expect(healthColor(theme, MpdHealthStatusEnum.Gray)).toEqual({
      bg: theme.palette.chipGrayLight.main,
      color: theme.palette.chipGrayDark.main,
    });
  });
});

describe('getQuarterLabel', () => {
  it('formats a fiscal year and quarter', () => {
    expect(getQuarterLabel(2025, 4)).toBe('FQ4 25');
    expect(getQuarterLabel(2026, 1)).toBe('FQ1 26');
  });
});

describe('getQuarterMonthRange', () => {
  it('starts Q1 in September of the previous calendar year', () => {
    expect(getQuarterMonthRange(2026, 1)).toEqual({
      start: { year: 2025, month: 9 },
      end: { year: 2025, month: 11 },
    });
  });

  it('rolls Q2 over from December into the fiscal year', () => {
    expect(getQuarterMonthRange(2026, 2)).toEqual({
      start: { year: 2025, month: 12 },
      end: { year: 2026, month: 2 },
    });
  });

  it('covers March to May for Q3', () => {
    expect(getQuarterMonthRange(2026, 3)).toEqual({
      start: { year: 2026, month: 3 },
      end: { year: 2026, month: 5 },
    });
  });

  it('covers June to August for Q4', () => {
    expect(getQuarterMonthRange(2026, 4)).toEqual({
      start: { year: 2026, month: 6 },
      end: { year: 2026, month: 8 },
    });
  });
});

describe('healthLabel', () => {
  it.each([
    [MpdHealthStatusEnum.Green, 'on track'],
    [MpdHealthStatusEnum.Red, 'at risk'],
    [MpdHealthStatusEnum.Yellow, 'needs attention'],
    [MpdHealthStatusEnum.Gray, 'no data'],
  ])('maps %s to "%s"', (health, expected) => {
    expect(healthLabel(t, health)).toBe(expected);
  });
});

describe('getLocalizedAssignmentCategoryGroup', () => {
  it.each([
    [MpdAssignmentCategoryGroupEnum.FullTime, 'Full time'],
    [MpdAssignmentCategoryGroupEnum.PartTime, 'Part time'],
  ])('maps %s to "%s"', (group, expected) => {
    expect(getLocalizedAssignmentCategoryGroup(t, group)).toBe(expected);
  });

  it('falls back to the placeholder for a group the client enum does not know', () => {
    expect(
      getLocalizedAssignmentCategoryGroup(
        t,
        'ON_CALL' as MpdAssignmentCategoryGroupEnum,
      ),
    ).toBe(pendingField);
  });
});

describe('quarterAmountLabel', () => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const label = (args: Partial<Parameters<typeof quarterAmountLabel>[0]>) =>
    quarterAmountLabel({
      t,
      status: MpdHealthStatusEnum.Green,
      averagePayroll: 4013.42,
      formatCurrency,
      ...args,
    });

  it('formats the amount when the quarter has payroll data', () => {
    expect(label({})).toBe('$4013.42');
  });

  it('reads Partial when the quarter reports no average', () => {
    expect(label({ averagePayroll: null })).toBe('Partial');
  });

  it('dashes a gray quarter rather than formatting a zero', () => {
    expect(label({ averagePayroll: 0, status: MpdHealthStatusEnum.Gray })).toBe(
      '-',
    );
  });

  it('shows the amount for a gray quarter that has real payroll', () => {
    expect(
      label({ averagePayroll: 3200, status: MpdHealthStatusEnum.Gray }),
    ).toBe('$3200.00');
  });

  it('prefers Partial over the gray dash when both apply', () => {
    expect(
      label({ averagePayroll: null, status: MpdHealthStatusEnum.Gray }),
    ).toBe('Partial');
  });
});

describe('buildQuarterChips', () => {
  const completedQuarters: CompletedQuarterPayroll[] = [
    {
      fiscalYear: 2025,
      quarter: 4,
      averagePayroll: 4013.42,
      status: MpdHealthStatusEnum.Yellow,
    },
    {
      fiscalYear: 2026,
      quarter: 1,
      averagePayroll: 4548.05,
      status: MpdHealthStatusEnum.Green,
    },
  ];

  it('returns completed quarters newest first when there is no starting quarter', () => {
    expect(
      buildQuarterChips({ monthlyGrossSalary: 0, completedQuarters }),
    ).toEqual([
      {
        fiscalYear: 2026,
        quarter: 1,
        status: MpdHealthStatusEnum.Green,
        averagePayroll: 4548.05,
      },
      {
        fiscalYear: 2025,
        quarter: 4,
        status: MpdHealthStatusEnum.Yellow,
        averagePayroll: 4013.42,
      },
    ]);
  });

  it('sets the starting quarter with a null averagePayroll and Gray status', () => {
    const startingQuarter: StartingQuarterPayroll = {
      fiscalYear: 2025,
      quarter: 3,
      months: [],
    };

    const chips = buildQuarterChips({
      monthlyGrossSalary: 0,
      startingQuarter,
      completedQuarters,
    });

    expect(chips).toContainEqual({
      fiscalYear: 2025,
      quarter: 3,
      status: MpdHealthStatusEnum.Gray,
      averagePayroll: null,
    });
  });

  it('sorts the starting quarter into newest-first order even when it falls in the middle', () => {
    const startingQuarter: StartingQuarterPayroll = {
      fiscalYear: 2025,
      quarter: 3,
      months: [],
    };

    const chips = buildQuarterChips({
      monthlyGrossSalary: 0,
      startingQuarter,
      completedQuarters,
    });

    expect(
      chips.map(({ fiscalYear, quarter }) => `${fiscalYear}-${quarter}`),
    ).toEqual(['2026-1', '2025-4', '2025-3']);
  });
});

const team = (name: string) => ({
  id: name.toLowerCase(),
  name,
  department: 'US Campus',
});
const quarter = (
  fiscalYear: number,
  q: number,
  status: MpdHealthStatusEnum,
) => ({
  fiscalYear,
  quarter: q,
  averagePayroll: 1000,
  status,
});
const withQuarters = (
  overrides: Parameters<typeof managedStaffMember>[0],
  quarters: ReturnType<typeof quarter>[],
) =>
  managedStaffMember({
    ...overrides,
    quarterlyHealth: { monthlyGrossSalary: 4500, completedQuarters: quarters },
  });

const john = managedStaffMember({
  firstName: 'John',
  lastName: 'Smith',
  personNumber: '1',
  spousePersonNumber: '2',
  spouseFirstName: 'Jane',
  spouseLastName: 'Smith',
  teams: { employee: [team('Campus')], spouse: [team('Campus'), team('City')] },
});
const jane = managedStaffMember({
  firstName: 'Jane',
  lastName: 'Smith',
  personNumber: '2',
  spousePersonNumber: '1',
  spouseFirstName: 'John',
  spouseLastName: 'Smith',
  teams: { employee: [team('Campus'), team('City')], spouse: [team('Campus')] },
});
const alice = managedStaffMember({
  firstName: 'Alice',
  lastName: 'Jones',
  personNumber: '3',
  spousePersonNumber: '99',
  spouseFirstName: 'Bob',
  spouseLastName: 'Jones',
  teams: { employee: [team('City')], spouse: [] },
});

describe('mergeSpouseRows', () => {
  it('folds a spouse pair into one row in the first position', () => {
    const rows = mergeSpouseRows([alice, john, jane]);
    expect(rows.map(({ personNumber }) => personNumber)).toEqual(['3', '1']);
    expect(rows[1].partner?.personNumber).toBe('2');
  });

  it('leaves a row alone when the spouse is not in the list', () => {
    const rows = mergeSpouseRows([alice]);
    expect(rows).toHaveLength(1);
    expect(rows[0].partner).toBeUndefined();
  });

  it('only merges a mutual pair', () => {
    const stale = managedStaffMember({ ...jane, spousePersonNumber: '42' });
    expect(mergeSpouseRows([john, stale])).toHaveLength(2);
  });

  it('unions the team names for display', () => {
    const [row] = mergeSpouseRows([john, jane]);
    expect(getRowTeamNames(row)).toEqual(['Campus', 'City']);
  });
});

describe('getRowName', () => {
  it('joins both first names before a shared last name', () => {
    expect(getRowName({ ...john, partner: jane })).toBe('John & Jane Smith');
  });

  it('uses both full names when the last names differ', () => {
    expect(getRowName({ ...john, partner: { ...jane, lastName: 'Doe' } })).toBe(
      'John Smith & Jane Doe',
    );
  });

  it('is the full name for a single member', () => {
    expect(getRowName(alice)).toBe('Alice Jones');
  });
});

describe('getRowInitials', () => {
  it('uses both first initials for a pair', () => {
    expect(getRowInitials({ ...john, partner: jane })).toBe('JJ');
  });

  it('uses first and last initials for a single member', () => {
    expect(getRowInitials(alice)).toBe('AJ');
  });
});

describe('countPeople', () => {
  it('counts a merged pair as two people', () => {
    expect(countPeople([{ ...john, partner: jane }, alice])).toBe(3);
  });
});

describe('latestQuarterStatus', () => {
  it('takes the newest completed quarter', () => {
    const member = withQuarters({}, [
      quarter(2026, 1, MpdHealthStatusEnum.Green),
      quarter(2026, 3, MpdHealthStatusEnum.Red),
      quarter(2025, 4, MpdHealthStatusEnum.Yellow),
    ]);
    expect(latestQuarterStatus(member)).toBe(MpdHealthStatusEnum.Red);
  });

  it('is no data without a completed quarter', () => {
    expect(latestQuarterStatus(withQuarters({}, []))).toBe(
      MpdHealthStatusEnum.Gray,
    );
  });
});

describe('summarizeTeams', () => {
  const red = (overrides: Parameters<typeof managedStaffMember>[0]) =>
    withQuarters(overrides, [quarter(2026, 3, MpdHealthStatusEnum.Red)]);
  const green = (overrides: Parameters<typeof managedStaffMember>[0]) =>
    withQuarters(overrides, [quarter(2026, 3, MpdHealthStatusEnum.Green)]);

  it('counts people per latest-quarter status on each of their teams', () => {
    const rows = mergeSpouseRows([
      red({
        personNumber: '1',
        teams: { employee: [team('Campus'), team('City')], spouse: [] },
      }),
      green({
        personNumber: '2',
        teams: { employee: [team('City')], spouse: [] },
      }),
    ]);
    expect(summarizeTeams(rows)).toEqual([
      {
        name: 'Campus',
        staffCount: 1,
        counts: { RED: 1, YELLOW: 0, GREEN: 0, GRAY: 0 },
      },
      {
        name: 'City',
        staffCount: 2,
        counts: { RED: 1, YELLOW: 0, GREEN: 1, GRAY: 0 },
      },
    ]);
  });

  it('counts each spouse of a merged pair on their own teams', () => {
    const rows = mergeSpouseRows([green(john), green(jane)]);
    expect(rows).toHaveLength(1);
    const summary = summarizeTeams(rows);
    expect(summary.find(({ name }) => name === 'Campus')?.staffCount).toBe(2);
    expect(summary.find(({ name }) => name === 'City')?.staffCount).toBe(1);
  });

  it('treats a member with no completed quarter as no data', () => {
    const rows = [
      withQuarters({ teams: { employee: [team('Campus')], spouse: [] } }, []),
    ];
    expect(summarizeTeams(rows)[0].counts.GRAY).toBe(1);
  });

  it('skips a member on no team', () => {
    expect(
      summarizeTeams([green({ teams: { employee: [], spouse: [] } })]),
    ).toEqual([]);
  });

  it('sorts the teams needing the most attention first', () => {
    const rows = [
      green({
        personNumber: '1',
        teams: { employee: [team('Alpha')], spouse: [] },
      }),
      withQuarters(
        { personNumber: '2', teams: { employee: [team('Beta')], spouse: [] } },
        [quarter(2026, 3, MpdHealthStatusEnum.Yellow)],
      ),
      red({
        personNumber: '3',
        teams: { employee: [team('Gamma')], spouse: [] },
      }),
    ];
    expect(summarizeTeams(rows).map(({ name }) => name)).toEqual([
      'Gamma',
      'Beta',
      'Alpha',
    ]);
  });
});

describe('getLocalizedSupportType', () => {
  it('labels each support type and falls back to the placeholder', () => {
    expect(
      getLocalizedSupportType(t, PeopleGroupSupportTypeEnum.SupportedRmo),
    ).toBe('Supported RMO');
    expect(
      getLocalizedSupportType(t, PeopleGroupSupportTypeEnum.SupportedNonRmo),
    ).toBe('Supported non-RMO');
    expect(
      getLocalizedSupportType(t, PeopleGroupSupportTypeEnum.Designation),
    ).toBe('Designation');
    expect(getLocalizedSupportType(t, PeopleGroupSupportTypeEnum.None)).toBe(
      'Not supported',
    );
    expect(getLocalizedSupportType(t, null)).toBe(pendingField);
  });
});

describe('getLocalizedSecaStatus', () => {
  it('labels each SECA status and falls back to the placeholder', () => {
    expect(getLocalizedSecaStatus(t, SecaStatusEnum.Seca)).toBe('Pays SECA');
    expect(getLocalizedSecaStatus(t, SecaStatusEnum.Fica)).toBe('Pays FICA');
    expect(getLocalizedSecaStatus(t, SecaStatusEnum.Optout)).toBe(
      'Exempt from SECA',
    );
    expect(getLocalizedSecaStatus(t, undefined)).toBe(pendingField);
  });
});
