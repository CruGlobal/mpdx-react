import {
  MIN_SUPPORTED_SHELL_VERSION,
  compareShellVersions,
  isShellVersionSupported,
  parseShellVersion,
} from './shellVersion';

describe('MIN_SUPPORTED_SHELL_VERSION', () => {
  it('is a three-segment semver string', () => {
    expect(MIN_SUPPORTED_SHELL_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('parseShellVersion', () => {
  it.each([
    [
      'token appended to a real iOS webview UA',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MPDXShell/1.2.3',
      '1.2.3',
    ],
    [
      'token appended to a real Android webview UA',
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 MPDXShell/0.1.0',
      '0.1.0',
    ],
    ['token alone', 'MPDXShell/10.20.30', '10.20.30'],
    [
      'token in the middle of the UA',
      'Mozilla/5.0 MPDXShell/2.0.1 Safari/605.1.15',
      '2.0.1',
    ],
  ])('extracts the version when the %s', (_name, userAgent, expected) => {
    expect(parseShellVersion(userAgent)).toBe(expected);
  });

  it.each([
    [
      'plain browser UA without the token',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
    ],
    ['empty string', ''],
    ['non-numeric version', 'MPDXShell/abc'],
    ['two-segment version', 'MPDXShell/1.2'],
    ['missing version', 'MPDXShell/'],
    ['lowercased token (token is case-sensitive)', 'mpdxshell/1.2.3'],
  ])('returns null for a %s', (_name, userAgent) => {
    expect(parseShellVersion(userAgent)).toBeNull();
  });
});

describe('compareShellVersions', () => {
  it.each([
    ['1.0.0', '1.0.0', 0],
    ['0.1.0', '0.1.0', 0],
    ['0.1.0', '0.1.1', -1],
    ['0.1.1', '0.1.0', 1],
    ['0.9.9', '1.0.0', -1],
    ['2.0.0', '1.9.9', 1],
    // Numeric, not lexicographic: '10' > '9' even though '10' < '9' as strings
    ['0.10.0', '0.9.0', 1],
    ['0.2.0', '0.10.0', -1],
    ['1.0.10', '1.0.2', 1],
  ])('compareShellVersions(%s, %s) has sign %i', (a, b, sign) => {
    expect(Math.sign(compareShellVersions(a, b))).toBe(sign);
  });
});

describe('isShellVersionSupported', () => {
  const [major] = MIN_SUPPORTED_SHELL_VERSION.split('.').map(Number);

  it('returns false for null (shell UA missing or unparseable)', () => {
    expect(isShellVersionSupported(null)).toBe(false);
  });

  it('returns false below the minimum', () => {
    expect(isShellVersionSupported('0.0.0')).toBe(false);
  });

  it('returns true at exactly the minimum', () => {
    expect(isShellVersionSupported(MIN_SUPPORTED_SHELL_VERSION)).toBe(true);
  });

  it('returns true above the minimum', () => {
    expect(isShellVersionSupported(`${major + 1}.0.0`)).toBe(true);
  });
});
