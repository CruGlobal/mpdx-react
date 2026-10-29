import { partnerAccountLabel } from './partnerAccountLabel';

describe('partnerAccountLabel', () => {
  it('uses the account number when there is no name', () => {
    expect(partnerAccountLabel('', '123')).toBe('123');
    expect(partnerAccountLabel(null, '123')).toBe('123');
    expect(partnerAccountLabel(undefined, '123')).toBe('123');
  });

  it('uses the name when it already includes the account number', () => {
    expect(partnerAccountLabel('Smith (123)', '123')).toBe('Smith (123)');
  });

  it('appends the account number to the name', () => {
    expect(partnerAccountLabel('Smith', '123')).toBe('Smith (123)');
  });

  it('uses the name when there is no account number', () => {
    expect(partnerAccountLabel('Smith', '')).toBe('Smith');
  });
});
