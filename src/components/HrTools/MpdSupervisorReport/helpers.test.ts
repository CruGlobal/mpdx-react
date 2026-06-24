import theme from 'src/theme';
import { getInitials, healthColor } from './helpers';
import { QuarterHealthEnum } from './mockData';

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
    expect(healthColor(theme, QuarterHealthEnum.Green)).toEqual({
      bg: theme.palette.chipGreenLight.main,
      color: theme.palette.chipGreenDark.main,
    });
  });

  it('returns red palette colors for Red', () => {
    expect(healthColor(theme, QuarterHealthEnum.Red)).toEqual({
      bg: theme.palette.chipRedLight.main,
      color: theme.palette.chipRedDark.main,
    });
  });

  it('returns yellow palette colors for Yellow', () => {
    expect(healthColor(theme, QuarterHealthEnum.Yellow)).toEqual({
      bg: theme.palette.chipYellowLight.main,
      color: theme.palette.chipYellowDark.main,
    });
  });
});
