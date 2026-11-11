import { TFunction } from 'i18next';
import {
  MpdHealthStatusEnum,
  MpdHouseholdTypeEnum,
} from 'src/graphql/types.generated';
import {
  balanceAmountLabel,
  balanceMonthHeaders,
  balanceMonthLabel,
  balanceStatusLabel,
  formatWholeDollars,
  householdTypeLabel,
} from './balanceHelpers';

const t = ((key: string, options?: Record<string, string>) =>
  key.replace(/{{(\w+)}}/g, (_, name) => options?.[name] ?? '')) as TFunction;

describe('balanceStatusLabel', () => {
  it.each([
    [MpdHealthStatusEnum.Green, 'At or above buffer'],
    [MpdHealthStatusEnum.Yellow, 'Below buffer'],
    [MpdHealthStatusEnum.Red, 'Below $0'],
    [MpdHealthStatusEnum.Blue, 'Not graded'],
    [MpdHealthStatusEnum.Gray, 'No data'],
  ])('names %s as %s', (status, label) => {
    expect(balanceStatusLabel(t, status)).toBe(label);
  });
});

describe('householdTypeLabel', () => {
  it.each([
    [MpdHouseholdTypeEnum.Family, 'Family'],
    [MpdHouseholdTypeEnum.Couple, 'Couple'],
    [MpdHouseholdTypeEnum.Single, 'Single'],
  ])('names %s as %s', (householdType, label) => {
    expect(householdTypeLabel(t, householdType)).toBe(label);
  });
});

describe('balanceMonthLabel', () => {
  it('formats the API month as a short month and year', () => {
    expect(balanceMonthLabel('2026-10', 'en-US')).toBe('Oct 2026');
    expect(balanceMonthLabel('2027-01', 'en-US')).toBe('Jan 2027');
  });
});

describe('balanceAmountLabel', () => {
  it('formats a balance in whole dollars, negative and zero included', () => {
    expect(balanceAmountLabel(12345.67, 'en-US')).toBe('$12,346');
    expect(balanceAmountLabel(-250.5, 'en-US')).toBe('-$251');
    expect(balanceAmountLabel(0, 'en-US')).toBe('$0');
  });

  it('dashes a month with no balance', () => {
    expect(balanceAmountLabel(null, 'en-US')).toBe('-');
  });
});

describe('formatWholeDollars', () => {
  it('drops the cents from a buffer', () => {
    expect(formatWholeDollars(8000, 'en-US')).toBe('$8,000');
  });
});

describe('balanceMonthHeaders', () => {
  it("labels each of the first row's months, with the full month in the tooltip", () => {
    const balances = [
      { month: '2026-10', endBalance: 1, status: MpdHealthStatusEnum.Green },
      { month: '2026-09', endBalance: null, status: MpdHealthStatusEnum.Gray },
    ];

    expect(balanceMonthHeaders(t, balances, 'en-US')).toEqual([
      {
        label: 'Oct 2026',
        tooltip: 'Staff account balance at the end of October 2026',
      },
      {
        label: 'Sep 2026',
        tooltip: 'Staff account balance at the end of September 2026',
      },
    ]);
  });
});
