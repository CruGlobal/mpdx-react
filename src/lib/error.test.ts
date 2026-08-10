import { getErrorMessage } from './error';

describe('getErrorMessage', () => {
  it('returns the message from an Error', () => {
    expect(getErrorMessage(new Error('Something broke'))).toBe(
      'Something broke',
    );
  });

  it('stringifies other values', () => {
    expect(getErrorMessage('Something broke')).toBe('Something broke');
    expect(getErrorMessage(null)).toBe('null');
  });
});
