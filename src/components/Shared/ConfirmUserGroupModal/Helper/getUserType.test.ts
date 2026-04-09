import { UserTypeEnum } from 'src/graphql/types.generated';
import { getUserType } from './getUserType';

const t = (key: string) => key;

describe('getUserType', () => {
  it('returns correct user type for US Staff', () => {
    expect(getUserType(UserTypeEnum.UsStaff, t)).toBe('Cru US Staff');
  });

  it('returns correct user type for Global Staff', () => {
    expect(getUserType(UserTypeEnum.GlobalStaff, t)).toBe('Cru Global Staff');
  });

  it('returns correct user type for Non Cru User', () => {
    expect(getUserType(UserTypeEnum.NonCru, t)).toBe('Non Cru User');
  });

  it('returns "Unknown" for undefined user type', () => {
    expect(getUserType(undefined, t)).toBe('Unknown');
  });
});
