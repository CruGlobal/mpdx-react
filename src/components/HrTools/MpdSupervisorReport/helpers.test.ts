import { TFunction } from 'i18next';
import {
  CompletedQuarterPayroll,
  MpdHealthStatusEnum,
  StartingQuarterPayroll,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import {
  buildQuarterChips,
  getInitials,
  getQuarterLabel,
  healthColor,
  healthLabel,
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
