import i18n from 'src/lib/i18n';
import { FundTypeEnum } from '../mockData';
import { getFundLabel } from './getFundLabel';

describe('getFundLabel', () => {
  it('returns the Primary Account label', () => {
    expect(getFundLabel(FundTypeEnum.Primary, i18n.t)).toBe('Primary Account');
  });

  it('returns the Savings Account label', () => {
    expect(getFundLabel(FundTypeEnum.Savings, i18n.t)).toBe('Savings Account');
  });

  it('returns the Conference Savings Account label', () => {
    expect(getFundLabel(FundTypeEnum.ConferenceSavings, i18n.t)).toBe(
      'Staff Conference Savings Account',
    );
  });

  it('returns an empty string for an unknown fund', () => {
    expect(getFundLabel('staffAccount', i18n.t)).toBe('N/A');
  });

  it('returns an empty string when the fund is undefined', () => {
    expect(getFundLabel(undefined, i18n.t)).toBe('N/A');
  });
});
