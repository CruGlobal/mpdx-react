import { TFunction } from 'i18next';
import {
  CompletedQuarterPayroll,
  MpdAssignmentCategoryGroupEnum,
  MpdHealthStatusEnum,
  StartingQuarterPayroll,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  buildQuarterChips,
  getInitials,
  getLocalizedAssignmentCategoryGroup,
  getQuarterLabel,
  getQuarterMonthRange,
  healthColor,
  healthLabel,
  pendingField,
  quarterAmountLabel,
} from './helpers';

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

  it('returns completed quarters as-is when there is no starting quarter', () => {
    expect(
      buildQuarterChips({ monthlyGrossSalary: 0, completedQuarters }),
    ).toEqual([
      {
        fiscalYear: 2025,
        quarter: 4,
        status: MpdHealthStatusEnum.Yellow,
        averagePayroll: 4013.42,
      },
      {
        fiscalYear: 2026,
        quarter: 1,
        status: MpdHealthStatusEnum.Green,
        averagePayroll: 4548.05,
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

  it('sorts the starting quarter into chronological order even when it falls in the middle', () => {
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
    ).toEqual(['2025-3', '2025-4', '2026-1']);
  });
});
