import { MpdHealthStatusEnum } from 'src/graphql/types.generated';
import theme from 'src/theme';
import { getInitials, healthColor } from './helpers';

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
