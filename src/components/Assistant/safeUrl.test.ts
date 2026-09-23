import { toSafeHttpUrl } from './safeUrl';

describe('toSafeHttpUrl', () => {
  it('keeps http and https urls', () => {
    expect(toSafeHttpUrl('https://help.test/a?b=1')).toBe(
      'https://help.test/a?b=1',
    );
    expect(toSafeHttpUrl('http://help.test/')).toBe('http://help.test/');
  });

  it('rejects other protocols and invalid urls', () => {
    expect(toSafeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(toSafeHttpUrl('data:text/html,hi')).toBeNull();
    expect(toSafeHttpUrl('/relative')).toBeNull();
    expect(toSafeHttpUrl('')).toBeNull();
  });
});
