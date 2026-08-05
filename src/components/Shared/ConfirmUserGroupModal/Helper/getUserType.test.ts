import { UserTypeEnum } from 'src/graphql/types.generated';
import { getUserType } from './getUserType';

const t = (key: string) => key;

describe('getUserType', () => {
  it('returns correct label and sublabel for US Staff', () => {
    const result = getUserType(UserTypeEnum.UsStaff, t);
    expect(result.label).toBe('Cru US Staff');
    expect(result.sublabel).toBe(
      'Users in this group receive (mostly) US donations and are paid through our US HR system.',
    );
  });

  it('returns correct label and sublabel for Global Staff', () => {
    const result = getUserType(UserTypeEnum.GlobalStaff, t);
    expect(result.label).toBe('Cru Global Staff');
    expect(result.sublabel).toBe(
      'Users in this group receive (mostly) non-US donations and are paid through our Global NetSuite system.',
    );
  });

  it('returns correct label and sublabel for Non Cru User', () => {
    const result = getUserType(UserTypeEnum.NonCru, t);
    expect(result.label).toBe("We see you're not on staff with Cru.");
    expect(result.sublabel).toBe(null);
  });

  it('returns correct label and sublabel for Hybrid Staff', () => {
    const result = getUserType(UserTypeEnum.HybridStaff, t);
    expect(result.label).toBe('Cru Hybrid Staff');
    expect(result.sublabel).toBe(
      'Users in this group receive donations through our Global NetSuite system but also need access to US HR forms (Salary Calc, MHA Calc, etc).',
    );
  });

  it('returns correct label and sublabel for undefined user type', () => {
    const result = getUserType(undefined, t);
    expect(result.label).toBe('Unknown');
    expect(result.sublabel).toBe(null);
  });
});
